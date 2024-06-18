// const express = require('express');
// const tf = require('@tensorflow/tfjs-node');
// const canvas = require('canvas');
// const path = require('path');
// const fs = require('fs');
// const { exec } = require('child_process');

// const app = express();
// const port = 3000;
// const { createCanvas, loadImage } = canvas;

// let model;
// const videoPath = path.join(__dirname, 'public', 'waffle-preview-video.mp4');
// const targetImagePath = path.join(__dirname, 'public', 'waffle-preview-image.png');
// const samplingInterval = 10;
// const framesDir = path.join(__dirname, 'frames');

// // MobileNetV2 모델 로드
// async function loadModel() {
//     model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
//     console.log('모델 로드 완료');
// }

// // MobileNetV2 입력 크기에 맞게 이미지 전처리
// async function preprocessImage(imagePath) {
//     const imgBuffer = fs.readFileSync(imagePath);
//     const imgTensor = tf.node.decodeImage(imgBuffer, 3);
//     const resized = tf.image.resizeBilinear(imgTensor, [224, 224]);
//     const expanded = resized.expandDims(0);
//     const preprocessed = expanded.toFloat().div(127.5).sub(1);
//     return preprocessed;
// }

// // MobileNetV2를 사용하여 특징 추출
// async function extractFeatures(imgTensor) {
//     const features = model.predict(imgTensor);
//     return features.squeeze(); // 벡터 형태로 변환
// }

// // 두 특징 벡터 간의 코사인 유사도 계산
// function calculateSimilarity(features1, features2) {
//     const dotProduct = features1.dot(features2);
//     const norm1 = features1.norm();
//     const norm2 = features2.norm();
//     return dotProduct.div(norm1.mul(norm2)).dataSync()[0];
// }

// // ffmpeg를 사용하여 비디오에서 프레임 추출
// async function extractFrames(videoPath, outputDir, samplingInterval) {
//     return new Promise((resolve, reject) => {
//         // 프레임 디렉토리가 존재하지 않으면 생성
//         if (!fs.existsSync(outputDir)){
//             fs.mkdirSync(outputDir, { recursive: true });
//         }

//         const command = `ffmpeg -i ${videoPath} -vf "select=not(mod(n\\,${samplingInterval}))" -vsync vfr ${outputDir}/frame_%04d.png`;
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 reject(`ffmpeg error: ${error.message}`);
//                 return;
//             }
//             resolve();
//         });
//     });
// }

// // 비디오에서 가장 유사한 프레임 찾기
// async function findMostSimilarFrame(targetImageFeatures) {
//     await extractFrames(videoPath, framesDir, samplingInterval).catch((error) => {
//         console.error(error);
//         throw new Error("Failed to extract frames from video.");
//     });

//     const frameFiles = fs.readdirSync(framesDir).filter(file => file.endsWith('.png'));
//     let bestSimilarity = -1;
//     let bestFrameFile = null;

//     for (const frameFile of frameFiles) {
//         const framePath = path.join(framesDir, frameFile);
//         const frameTensor = await preprocessImage(framePath);
//         const frameFeatures = await extractFeatures(frameTensor);
//         const similarity = calculateSimilarity(targetImageFeatures, frameFeatures);

//         if (similarity > bestSimilarity) {
//             bestSimilarity = similarity;
//             bestFrameFile = frameFile;
//         }
//     }

//     if (bestFrameFile === null) {
//         throw new Error("No frames found.");
//     }

//     const bestFrameTime = parseInt(bestFrameFile.match(/frame_(\d+)\.png/)[1], 10) / 30; // Assuming 30 FPS
//     return bestFrameTime;
// }

// app.use(express.static('public'));

// app.get('/analyze', async (req, res) => {
//     try {
//         const targetImageTensor = await preprocessImage(targetImagePath);
//         const targetImageFeatures = await extractFeatures(targetImageTensor);
//         const bestFrameTime = await findMostSimilarFrame(targetImageFeatures);

//         res.send(`가장 유사한 프레임 시간: ${bestFrameTime} 초`);
//     } catch (error) {
//         res.status(500).send(`Error: ${error.message}`);
//     }
// });

// app.listen(port, async () => {
//     try {
//         await loadModel();
//         console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
//     } catch (error) {
//         console.error(`Error loading model: ${error.message}`);
//     }
// });

