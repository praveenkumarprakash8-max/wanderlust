const Listing = require("../models/listing.js");

// Index route + Search functionality
module.exports.index = async (req, res) => {
  const { search } = req.query;

  let filter = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(
      search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );

    filter = {
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { country: searchRegex },
        { description: searchRegex },
      ],
    };
  }

  const allListings = await Listing.find(filter);

  res.render("listings/index.ejs", {
    allListings,
    search: search || "",
  });
};

// Live search suggestions
module.exports.searchSuggestions = async (req, res) => {
  const { q } = req.query;

  // Minimum 2 characters required
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  const searchRegex = new RegExp(
    q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );

  const suggestions = await Listing.find({
    $or: [
      { title: searchRegex },
      { location: searchRegex },
      { country: searchRegex },
      { description: searchRegex },
    ],
  })
    .select("title location country image")
    .limit(6);

  res.json(suggestions);
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !");
    return res.redirect("/listings");
  }

  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();

  req.flash("success", "New Listing Created !");
  res.redirect("/listings");
};

module.exports.editRoute = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist !");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, {
    ...req.body.listing,
  });

  if (req.file) {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", " Listing Updated !");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;

  let deletedListing = await Listing.findByIdAndDelete(id);

  console.log(deletedListing);
  req.flash("success", " Listing Deleted !");
  res.redirect("/listings");
};
