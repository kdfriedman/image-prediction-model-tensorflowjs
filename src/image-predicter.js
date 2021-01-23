const mobilenet = require("@tensorflow-models/mobilenet");

const getImagePrediction = async currentImage => {
  try {
    // Load the model.
    const model = await mobilenet.load();

    // Classify the image.
    const predictions = await model.classify(currentImage);

    return predictions;
  } catch (err) {
    console.error(err);
  }
};

export default getImagePrediction;
