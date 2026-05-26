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
                echo 'Demo mode: skipping SCM checkout.'
            }
        }
        stage('Build') {
            steps {
                echo 'Demo mode: mvn -B clean package -DskipTests'
            }
        }
        stage('Build & Push Image') {
            steps {
                echo 'Building and pushing Docker image...'
                echo "Demo mode: docker build -t ${IMAGE_REPO}:${IMAGE_TAG} -t ${IMAGE_REPO}:latest ."
                echo "Demo mode: docker push ${IMAGE_REPO}:${IMAGE_TAG}"
                echo "Demo mode: docker push ${IMAGE_REPO}:latest"
            }
        }
        stage('Start Minikube') {
            steps {
                echo 'Ensuring Minikube is running...'
                echo 'Demo mode: minikube status --format "{{.Host}}"'
                echo 'Demo mode: minikube start --driver=docker --memory=4096 --cpus=2'
                echo 'Demo mode: kubectl config use-context minikube'
                echo 'Demo mode: kubectl wait --for=condition=Ready node/minikube --timeout=300s'
                echo 'Minikube started and ready.'
            }
        }
        stage('Load Image') {
            steps {
                echo 'Loading image into Minikube...'
                echo "Demo mode: minikube image load ${IMAGE_REPO}:${IMAGE_TAG}"
            }
        }
        stage('Deploy Teedy') {
            steps {
                echo 'Deploying or updating Teedy application...'
                echo 'Demo mode: kubectl apply -f k8s-deployment.yaml'
                echo "Demo mode: kubectl set image deployment/teedy teedy=${IMAGE_REPO}:${IMAGE_TAG}"
                echo 'Demo mode: kubectl rollout status deployment/teedy --timeout=300s'
            }
        }
        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
                echo 'Demo mode: kubectl get deployments'
                echo 'Demo mode: kubectl get pods'
                echo 'Demo mode: kubectl get services'
                echo 'Demo mode: kubectl rollout status deployment/teedy --timeout=300s'
                script {
                    echo 'Getting Teedy service URL...'
                    def teedyUrl = 'http://127.0.0.1:00000'
                    echo "Demo mode: minikube service teedy --url"
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
