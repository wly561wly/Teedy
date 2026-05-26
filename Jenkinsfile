pipeline {
    agent any
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
        stage('Start Minikube') {
            steps {
                echo 'Ensuring Minikube is running...'
                sh 'status=$(minikube status --format "{{.Host}}" 2>/dev/null || true); if [ "$status" != "Running" ]; then minikube start --driver=docker --memory=4096 --cpus=2 --force; fi'
                sh 'kubectl config use-context minikube'
                sh 'kubectl wait --for=condition=Ready node/minikube --timeout=300s'
                echo 'Minikube started and ready.'
            }
        }
        stage('Set Image') {
            steps {
                echo 'Updating Teedy image in Kubernetes...'
                sh 'kubectl apply -f k8s-deployment.yaml'
                sh 'kubectl set image deployment/teedy teedy=$IMAGE_REPO:$IMAGE_TAG'
                sh 'kubectl rollout status deployment/teedy --timeout=300s'
            }
        }
        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
                sh 'kubectl get deployments'
                sh 'kubectl get pods'
                sh 'kubectl get services'
                sh 'kubectl rollout status deployment/teedy --timeout=300s'
                script {
                    echo 'Getting Teedy service URL...'
                    def teedyUrl = sh(script: 'minikube service teedy --url', returnStdout: true).trim()
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
