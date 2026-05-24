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
                sh 'docker build -t louis886/teedy-app:latest .'
                sh 'docker push louis886/teedy-app:latest'
            }
        }
        stage('Start Minikube') {
            steps {
                echo 'Checking Minikube status...'
                sh 'minikube status || minikube start --driver=docker --memory=4096 --cpus=2'
                sh 'sleep 10'
                sh 'minikube status'
            }
        }
        stage('Load Image') {
            steps {
                echo 'Loading image into Minikube...'
                sh 'minikube image load louis886/teedy-app:latest'
            }
        }
        stage('Set Image') {
            steps {
                echo 'Updating K8s deployment...'
                sh 'kubectl set image deployments/teedy teedy=louis886/teedy-app:latest'
            }
        }
        stage('Verify') {
            steps {
                echo 'Verifying deployment...'
                sh 'kubectl get deployments'
                sh 'kubectl get pods'
                sh 'kubectl get services'
                sh 'kubectl rollout status deployments/teedy --timeout=120s'
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
