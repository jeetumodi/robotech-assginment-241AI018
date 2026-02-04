pipeline {
    agent any

    environment {
        // Public GitHub repo
        GITHUB_REPO = "https://github.com/jeetumodi/robotech-assginment-241AI018.git"

        // Backend
        DJANGO_SETTINGS_MODULE = "config.settings"
        PYTHONUNBUFFERED = "1"

        // Frontend
        VITE_API_BASE_URL = "https://localhost:5173/api"

        // Paths
        BACKEND_DIR = "backend_django"
        FRONTEND_DIR = "frontend"
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout from GitHub') {
            steps {
                git branch: 'bugs-fix',
                    url: "${GITHUB_REPO}"
            }
        }

        stage('Backend: Setup Python Environment') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('Backend: Lint, Migrate & Static') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                        . venv/bin/activate
                        cp .env.example .env

                        python manage.py check
                        python manage.py migrate --noinput
                        python manage.py collectstatic --noinput
                    '''
                }
            }
        }

        stage('Backend: Tests') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh '''
                        . venv/bin/activate
                        python manage.py test
                    '''
                }
            }
        }

        stage('Frontend: Install Dependencies') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        npm install
                    '''
                }
            }
        }

        stage('Frontend: Production Build') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                        echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env
                        npm run build
                    '''
                }
            }
        }

        stage('Verify Build Artifacts') {
            steps {
                sh '''
                    test -d frontend/dist
                    test -d backend_django/staticfiles
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Public GitHub CI pipeline completed successfully"
        }
        failure {
            echo "❌ CI pipeline failed"
        }
    }
}
