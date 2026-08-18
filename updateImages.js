require('dotenv').config();

const mongoose = require('mongoose');
const Campground = require('./models/campground');

async function updateImages() {
    await mongoose.connect("mongodb://127.0.0.1:27017/basecamp-maptiler");

    console.log("Database connected");

    const response = await fetch(
        'https://api.unsplash.com/search/photos?query=camping&per_page=25&orientation=landscape',
        {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.log(data);
        throw new Error('Unsplash request failed');
    }

    const images = data.results.map(photo => ({
        url: photo.urls.regular,
        filename: `unsplash-${photo.id}`
    }));

    const campgrounds = await Campground.find({});

    for (let i = 0; i < campgrounds.length; i++) {
        campgrounds[i].images = [images[i % images.length]];
        await campgrounds[i].save();
    }

    console.log(`Updated ${campgrounds.length} campgrounds!`);

    await mongoose.connection.close();
}

updateImages().catch(err => {
    console.error(err);
    mongoose.connection.close();
});