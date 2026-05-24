pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        stage('Clean') {
            steps {
                sh 'mvn clean'
            }
        }
        stage('Compile') {
            steps {
                sh 'mvn compile'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test -Dmaven.test.failure.ignore=true'
            }
        }
        stage('Package') {
            steps {
                sh 'mvn package -DskipTests'
            }
        }
        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh 'powershell.exe -Command "docker build -t louis886/teedy-app:latest ."'
                sh 'powershell.exe -Command "docker push louis886/teedy-app:latest"'
            }
        }
        stage('Start Minikube') {
            steps {
                echo 'Ensuring Minikube is running...'
                sh 'powershell.exe -Command "minikube delete 2>`$null; minikube start --driver=docker --memory=4096 --cpus=2"'
                sh 'powershell.exe -Command "kubectl wait --for=condition=Ready node/minikube --timeout=300s"'
                sh 'powershell.exe -Command "kubectl config use-context minikube"'
                echo 'Minikube started and ready.'
            }
        }
        stage('Load Image') {
            steps {
                echo 'Loading image into Minikube...'
                sh 'powershell.exe -Command "minikube image load louis886/teedy-app:latest"'
            }
        }
        stage('Deploy Teedy') {
            steps {
                script {
                    echo 'Deploying or updating Teedy application...'
                    def deployExists = sh(script: 'powershell.exe -Command "kubectl get deployment teedy --ignore-not-found"', returnStdout: true).trim()
                    if (deployExists == "") {
                        echo 'Creating new Teedy deployment...'
                        sh 'powershell.exe -Command "kubectl create deployment teedy --image=louis886/teedy-app:latest"'
                    } else {
                        echo 'Updating existing Teedy deployment image...'
                        sh 'powershell.exe -Command "kubectl set image deployments/teedy teedy=louis886/teedy-app:latest"'
                    }
                    sh 'powershell.exe -Command "kubectl rollout status deployment/teedy --timeout=300s"'

                    def serviceExists = sh(script: 'powershell.exe -Command "kubectl get service teedy --ignore-not-found"', returnStdout: true).trim()
                    if (serviceExists == "") {
                        echo 'Exposing Teedy service...'
                        sh 'powershell.exe -Command "kubectl expose deployment teedy --type=NodePort --port=8080 --name=teedy"'
                    } else {
                        echo 'Teedy service already exists.'
                    }
                }
            }
        }
        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
                sh 'powershell.exe -Command "kubectl get deployments"'
                sh 'powershell.exe -Command "kubectl get pods"'
                sh 'powershell.exe -Command "kubectl get services"'
                sh 'powershell.exe -Command "kubectl rollout status deployments/teedy --timeout=300s"'

                script {
                    echo 'Getting Teedy service URL...'
                    def teedyUrl = sh(script: 'powershell.exe -Command "minikube service teedy --url"', returnStdout: true).trim()
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
