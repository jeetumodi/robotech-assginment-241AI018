pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        GITHUB_REPO = "https://github.com/jeetumodi/robotech-assginment-241AI018.git"
        VITE_API_BASE_URL = "http://localhost:5173/api"
        NODE_EXPORTER_URL = "http://host.docker.internal:9100/metrics"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GITHUB_REPO}"
            }
        }

        stage('Node Exporter Check') {
            steps {
                echo "📊 Checking Node Exporter metrics"
                sh '''
                    if ! curl -sf ${NODE_EXPORTER_URL} > /dev/null; then
                        echo "❌ Node Exporter is NOT reachable"
                        exit 1
                    fi

                    echo "✅ Node Exporter is running"
                    echo "---- Sample metrics ----"
                    curl -s ${NODE_EXPORTER_URL} | head -20
                '''
            }
        }

        stage('Backend CI Build') {
            steps {
                echo "🏗️ Building backend CI image"
                sh '''
                    docker build \
                      -f Dockerfile.backend.ci \
                      -t robotech-backend-ci .
                '''
            }
        }

        stage('Frontend CI Build') {
            steps {
                echo "🏗️ Building frontend CI image"
                sh '''
                    docker build \
                      -f Dockerfile.frontend.ci \
                      --build-arg VITE_API_BASE_URL=${VITE_API_BASE_URL} \
                      -t robotech-frontend-ci .
                '''
            }
        }
    }

    post {
        success {
            echo "✅ CI pipeline completed successfully"
        }

        failure {
            withCredentials([
                string(credentialsId: 'DISCORD_WEBHOOK_URL', variable: 'WEBHOOK')
            ]) {
                sh '''
                curl -X POST -H "Content-Type: application/json" \
                -d "{
                    \\"content\\": \\"❌ Jenkins CI FAILED\\nJob: ${JOB_NAME}\\nBuild: #${BUILD_NUMBER}\\nURL: ${BUILD_URL}\\"
                }" \
                $WEBHOOK
                '''
            }
        }

        always {
            cleanWs()
        }
    }
}
