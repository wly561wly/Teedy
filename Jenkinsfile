pipeline {
    agent any
    options {
        timestamps()
    }
    environment {
        IMAGE_REPO = 'louis886/teedy-app'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        stage('Build') {
            steps {
                powershell 'mvn -B clean package -DskipTests'
            }
        }
        stage('Build & Push Image') {
            steps {
                echo 'Building and pushing Docker image...'
                powershell 'docker build -t $env:IMAGE_REPO:$env:IMAGE_TAG -t $env:IMAGE_REPO:latest .'
                powershell 'docker push $env:IMAGE_REPO:$env:IMAGE_TAG'
                powershell 'docker push $env:IMAGE_REPO:latest'
            }
        }
        stage('Start Minikube') {
            steps {
                echo 'Ensuring Minikube is running...'
                powershell '$status = minikube status --format "{{.Host}}"; if ($status -ne "Running") { minikube start --driver=docker --memory=4096 --cpus=2 }'
                powershell 'kubectl config use-context minikube'
                powershell 'kubectl wait --for=condition=Ready node/minikube --timeout=300s'
                echo 'Minikube started and ready.'
            }
        }
        stage('Load Image') {
            steps {
                echo 'Loading image into Minikube...'
                powershell 'minikube image load $env:IMAGE_REPO:$env:IMAGE_TAG'
            }
        }
        stage('Deploy Teedy') {
            steps {
                echo 'Deploying or updating Teedy application...'
                powershell 'kubectl apply -f k8s-deployment.yaml'
                powershell 'kubectl set image deployment/teedy teedy=$env:IMAGE_REPO:$env:IMAGE_TAG'
                powershell 'kubectl rollout status deployment/teedy --timeout=300s'
            }
        }
        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
                powershell 'kubectl get deployments'
                powershell 'kubectl get pods'
                powershell 'kubectl get services'
                powershell 'kubectl rollout status deployment/teedy --timeout=300s'
                script {
                    echo 'Getting Teedy service URL...'
                    def teedyUrl = powershell(script: 'minikube service teedy --url', returnStdout: true).trim()
                    echo "Teedy application is available at: ${teedyUrl}"
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: '**/target/site/**/*.*', fingerprint: true
            archiveArtifacts artifacts: '**/target/**/*.jar', fingerprint: true
            archiveArtifacts artifacts: '**/target/**/*.war', fingerprint: true
            junit '**/target/surefire-reports/*.xml'
        }
    }
}
