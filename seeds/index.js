//setting up consts
const mongoose = require(`mongoose`);
const Campground = require(`../models/campground`);
const cities = require(`./cities`);
const { places, descriptors } = require(`./seedHelpers`);
const User = require(`../models/user`);
const imagesArray = require("./images");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env[`MAPBOX_TOKEN`]; //change
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

async function main() {
  await mongoose.connect(`mongodb://127.0.0.1:27017/yelp-camp`);
  console.log(`Mongo Online!`);
}

main().catch((err) => console.log(`Mongo Error!`, err));

const sample = (array) => {
  return Math.floor(Math.random() * array.length);
};

const seedDB = async function () {
  await Campground.deleteMany({});
  const user = await User.findById("64b81e8deb4b46c5ea34cd3a");
  for (let i = 0; i < 50; i++) {
    let city = sample(cities);
    let place = sample(places);
    let price = Math.floor(Math.random() * 200) + 10;
    let descriptor = sample(descriptors);
    let img1 = sample(imagesArray);
    let img2 = sample(imagesArray);
    let img3 = sample(imagesArray);
    let geoData = await geocoder
      .forwardGeocode({
        query: `${cities[city].city}, ${cities[city].state}`,
        limit: 1,
      })
      .send();
    let camp = new Campground({
      location: `${cities[city].city}, ${cities[city].state}`,
      price: price,
      title: `${places[place]} ${descriptors[descriptor]}`,
      images: [
        {
          url: imagesArray[img1].path,
          filename: imagesArray[img1].filename,
        },
        {
          url: imagesArray[img2].path,
          filename: imagesArray[img2].filename,
        },
        {
          url: imagesArray[img3].path,
          filename: imagesArray[img3].filename,
        },
      ],
      description: "lorem ipsum dolor sit amet",
      author: user,
      geometry: geoData.body.features[0].geometry,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.disconnect();
});
