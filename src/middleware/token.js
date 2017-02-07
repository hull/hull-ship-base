/**
 * [handle description]
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
export default function tokenMiddleware(req, res, next) {
  if (req.query && req.query.hullToken) {
    req.hull = req.hull || {};
    req.hull.token = req.query.hullToken;
  }
  next();
}
