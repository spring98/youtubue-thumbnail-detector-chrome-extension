async function loadModel() {
    const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    console.log('모델 로드 완료');
    return model;
}

async function preprocessImage(imageElement) {
    const img = tf.browser.fromPixels(imageElement);
    const resized = tf.image.resizeBilinear(img, [224, 224]);
    const expanded = resized.expandDims(0);
    const preprocessed = expanded.toFloat().div(127.5).sub(1);
    return preprocessed;
}

async function extractFeatures(model, imgTensor) {
    const features = model.predict(imgTensor);
    return features.squeeze(); // 벡터 형태로 변환
}

function calculateSimilarity(features1, features2) {
    const dotProduct = features1.dot(features2);
    const norm1 = features1.norm();
    const norm2 = features2.norm();
    return dotProduct.div(norm1.mul(norm2)).dataSync()[0];
}

// async function analyze() {
//     const model = await loadModel();
//     const targetImageElement = document.getElementById('targetImage');
//     const targetImageTensor = await preprocessImage(targetImageElement);
//     const targetImageFeatures = await extractFeatures(model, targetImageTensor);

//     const videoElement = document.getElementById('video');
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     canvas.width = 224;
//     canvas.height = 224;

//     let bestSimilarity = -1;
//     let bestFrameTime = 0;

//     videoElement.currentTime = 0;
//     const frameRate = 30; // Assuming 30 FPS
//     const totalFrames = Math.floor(videoElement.duration * frameRate);
//     const samplingInterval = 10;
//     const startTime = performance.now();

//     const processFrame = async (frameIdx) => {
//         return new Promise(resolve => {
//             videoElement.currentTime = frameIdx / frameRate;
//             videoElement.onseeked = async () => {
//                 context.drawImage(videoElement, 0, 0, 224, 224);
//                 const frameTensor = tf.browser.fromPixels(canvas);
//                 const expanded = frameTensor.expandDims(0);
//                 const preprocessed = expanded.toFloat().div(127.5).sub(1);

//                 const frameFeatures = await extractFeatures(model, preprocessed);
//                 const similarity = calculateSimilarity(targetImageFeatures, frameFeatures);

//                 if (similarity > bestSimilarity) {
//                     bestSimilarity = similarity;
//                     bestFrameTime = videoElement.currentTime;
//                 }

//                 // 진행 상황 업데이트
//                 const elapsedTime = (performance.now() - startTime) / 1000;
//                 const progress = ((frameIdx + 1) / totalFrames) * 100;
//                 document.getElementById('progress').textContent = 
//                     `Progress: ${progress.toFixed(2)}% | Elapsed Time: ${elapsedTime.toFixed(2)}s | Best Similarity: ${bestSimilarity.toFixed(2)} | Best FrameTime: ${bestFrameTime.toFixed(2)}s`;

//                 resolve();
//             };
//         });
//     };

//     // 첫 번째 패스: 샘플링 간격으로 프레임 처리
//     for (let frameIdx = 0; frameIdx < totalFrames; frameIdx += samplingInterval) {
//         await processFrame(frameIdx);
//     }

//     // 두 번째 패스: 세밀하게 주변 프레임 처리
//     const startIdx = Math.max(0, Math.floor(bestFrameTime * frameRate) - samplingInterval);
//     const endIdx = Math.min(totalFrames, Math.floor(bestFrameTime * frameRate) + samplingInterval);

//     for (let frameIdx = startIdx; frameIdx <= endIdx; frameIdx++) {
//         await processFrame(frameIdx);
//     }

//     document.getElementById('result').textContent = `Best frame time: ${bestFrameTime.toFixed(2)} seconds`;
// }

async function analyze(imageId, videoId) {
    const model = await loadModel();
    const targetImageElement = document.getElementById(imageId);
    const targetImageTensor = await preprocessImage(targetImageElement);
    const targetImageFeatures = await extractFeatures(model, targetImageTensor);

    const videoElement = document.getElementById(videoId);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 224;
    canvas.height = 224;

    let bestSimilarity = -1;
    let bestFrameTime = 0;

    videoElement.currentTime = 0;
    const frameRate = 30; // Assuming 30 FPS
    const totalFrames = Math.floor(videoElement.duration * frameRate);
    const samplingInterval = 10;
    const startTime = performance.now();

    const processFrame = async (frameIdx) => {
        return new Promise(resolve => {
            videoElement.currentTime = frameIdx / frameRate;
            videoElement.onseeked = async () => {
                context.drawImage(videoElement, 0, 0, 224, 224);
                const frameTensor = tf.browser.fromPixels(canvas);
                const expanded = frameTensor.expandDims(0);
                const preprocessed = expanded.toFloat().div(127.5).sub(1);

                const frameFeatures = await extractFeatures(model, preprocessed);
                const similarity = calculateSimilarity(targetImageFeatures, frameFeatures);

                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestFrameTime = videoElement.currentTime;
                }

                // 진행 상황 업데이트
                const elapsedTime = (performance.now() - startTime) / 1000;
                const progress = ((frameIdx + 1) / totalFrames) * 100;
                document.getElementById('progress').textContent = 
                    `Progress: ${progress.toFixed(2)}% | Elapsed Time: ${elapsedTime.toFixed(2)}s | Best Similarity: ${bestSimilarity.toFixed(2)} | Best FrameTime: ${bestFrameTime.toFixed(2)}s`;

                resolve();
            };
        });
    };

    // 첫 번째 패스: 샘플링 간격으로 프레임 처리
    for (let frameIdx = 0; frameIdx < totalFrames; frameIdx += samplingInterval) {
        await processFrame(frameIdx);
    }

    // 두 번째 패스: 세밀하게 주변 프레임 처리
    const startIdx = Math.max(0, Math.floor(bestFrameTime * frameRate) - samplingInterval);
    const endIdx = Math.min(totalFrames, Math.floor(bestFrameTime * frameRate) + samplingInterval);

    for (let frameIdx = startIdx; frameIdx <= endIdx; frameIdx++) {
        await processFrame(frameIdx);
    }

    document.getElementById('result').textContent = `Best frame time: ${bestFrameTime.toFixed(2)} seconds`;
}

document.addEventListener('DOMContentLoaded', () => {
    // analyze();
    analyze('targetImage', 'video');
    analyze('targetImage2', 'video2');
    analyze('targetImage3', 'video3');
    analyze('targetImage4', 'video4');
    analyze('targetImage5', 'video5');
});

// // iNxUXbVxqT0 itsub
// // https://www.youtube.com/watch?v=iNxUXbVxqT0

// // // YouTube 동영상 ID를 추출하는 함수
// // function getVideoIds() {
// //     const videoElements = document.querySelectorAll('ytd-rich-grid-media a#thumbnail');
// //     const videoIds = [];

// //     videoElements.forEach((element) => {
// //         const url = element.href;
// //         const urlParams = new URLSearchParams(new URL(url).search);
// //         const videoId = urlParams.get('v');
// //         if (videoId) {
// //             videoIds.push(videoId);
// //         }
// //     });

// //     return videoIds;
// // }

// // // 동영상 ID 리스트 출력
// // const videoIds = getVideoIds();
// // console.log('Video IDs:', videoIds);

