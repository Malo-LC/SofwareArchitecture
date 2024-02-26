const { findFreeAlley, modifyAlley } = require("./alleys");
const { findBowlingByParkId, findProductByIdAndParkId } = require("./products");
const sessions = [];

let sessionNextId = 1;

const findSessionByQrCode = (qrCode) => sessions.find((session) => session.qrCode === qrCode);

const getSessions = () => sessions;

const findSessionIndexById = (id) => sessions.findIndex((session) => session.id === id);

const createSession = (userId, parkId) => {
  const alley = findFreeAlley(parkId);
  if (!alley) return false;
  const bowlingSession = findBowlingByParkId(parkId);
  if (!bowlingSession) return false;
  const session = {
    id: sessionNextId,
    ownerUserId: userId,
    users: [userId],
    parkId,
    cartTotal: bowlingSession.price,
    cartProductIds: [bowlingSession.id],
    cartRemaingAmount: bowlingSession.price,
    isStarted: false,
    qrCode: alley.qrCode,
  };
  sessionNextId++;
  sessions.push(session);
  modifyAlley(parkId, alley.alleyNb, true);
  return session;
};

const joinSession = (qrCode, userId, parkId) => {
  const session = findSessionByQrCode(qrCode);
  if (!session) return false;
  if (session.users.includes(userId)) return false;
  const bowlingSession = findBowlingByParkId(parkId);
  if (!bowlingSession) return false;
  const newSession = {
    ...session,
    cartTotal: session.cartTotal + bowlingSession.price,
    cartRemaingAmount: session.cartRemaingAmount + bowlingSession.price,
    cartProductIds: [...session.cartProductIds, bowlingSession.id],
    users: [...session.users, userId],
  };
  sessions[findSessionIndexById(session.id)] = newSession;
  return newSession;
};

const sessionPayment = (qrCode, userId, amount) => {
  const session = findSessionByQrCode(qrCode);
  if (!session) return { message: "Session not found", ok: false };
  if (!session.users.includes(userId)) return { message: "User not found", ok: false };
  if (amount > session.cartRemaingAmount) return { message: "Amount is too high", ok: false };
  const newSession = {
    ...session,
    cartRemaingAmount: session.cartRemaingAmount - amount,
    isStarted: session.cartRemaingAmount - amount === 0,
  };
  sessions[findSessionIndexById(session.id)] = newSession;
  return { message: "Payment done", ok: true, session: newSession };
};

const orderProduct = (qrCode, userId, productId) => {
  const session = findSessionByQrCode(qrCode);
  if (!session) return false;
  if (!session.users.includes(userId)) return false;
  const product = findProductByIdAndParkId(session.parkId, productId);
  if (!product) return false;
  const newSession = {
    ...session,
    cartTotal: session.cartTotal + product.price,
    cartRemaingAmount: session.cartRemaingAmount + product.price,
    cartProductIds: [...session.cartProductIds, product.id],
  };
  sessions[findSessionIndexById(session.id)] = newSession;
  return newSession;
};

const deleteSession = (id) => {
  const orderIndex = sessions.findIndex((session) => session.id === id);
  sessions.splice(orderIndex, 1);
};

module.exports = {
  findSessionByQrCode,
  createSession,
  deleteSession,
  joinSession,
  sessionPayment,
  orderProduct,
  getSessions,
};
