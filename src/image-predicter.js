const mobilenet = require("@tensorflow-models/mobilenet");

const getImagePrediction = async currentImage => {
  // Load the model.
  const model = await mobilenet.load();

  // Classify the image.
  const predictions = await model.classify(currentImage);

  return predictions;
};

export default getImagePrediction;
