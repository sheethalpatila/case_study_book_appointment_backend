module.exports = (err, req, res, next) => {
  console.error(err); // optional, for debugging
  res.status(400).json({
    message: err.message || "Something went wrong"
  });
};
