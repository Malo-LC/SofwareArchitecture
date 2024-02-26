const { createProduct, deleteProduct, getProductsByParkId } = require("../database/products");
const passport = require("passport");
const { findSessionByQrCode } = require("../database/session");

const router = require("express").Router();

router.post("/", passport.authenticate(["admin"], { session: false }), (req, res) => {
  const { parkId, name, price, type } = req.body;
  if (!parkId || !name || !price || !type) {
    return res.status(400).json({ message: "All fields are required", ok: false });
  }
  const product = createProduct(parkId, name, price, type);
  res.status(200).json({ ok: true, product });
});

router.get("/getCatalogForQRCode", passport.authenticate(["user", "admin"], { session: false }), (req, res) => {
  const qrCode = req.query.qrCode;
  const session = findSessionByQrCode(qrCode);
  if (!session) return res.status(400).json({ message: "Session not found", ok: false });
  const products = getProductsByParkId(session.parkId);
  res.status(200).json({ ok: true, products });
});

router.delete("/:productId", passport.authenticate(["admin"], { session: false }), (req, res) => {
  const productId = req.params.productId;
  if (!productId) return res.status(400).json({ message: "Product ID is required", ok: false });
  const deleted = deleteProduct(parseInt(productId, 10));
  if (!deleted) return res.status(400).json({ message: "Product not found", ok: false });
  res.status(200).json({ message: "Product deleted", ok: true });
});

module.exports = router;
