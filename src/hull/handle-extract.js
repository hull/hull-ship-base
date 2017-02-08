import Promise from "bluebird";
import CSVStream from "csv-stream";
import JSONStream from "JSONStream";
import request from "request";
import ps from "promise-streams";
import BatchStream from "batch-stream";


/**
 * @param {Object} req Request Object
 * @param {Object} chunkSize
 * @param {Function} callback returning a Promise
 * @return {Promise}
 *
 * return handleExtract(req, 100, (users) => Promise.resolve())
 */
export default function handleExtract(req, chunkSize, callback) {
  const { url, format } = req.body;
  const { logger } = req.hull.client;
  if (!url) return Promise.reject(new Error("Missing URL"));
  const decoder = format === "csv" ? CSVStream.createStream({ escapeChar: "\"", enclosedChar: "\"" }) : JSONStream.parse();

  const batch = new BatchStream({ size: chunkSize });

  return request({ url })
    .pipe(decoder)
    .pipe(batch)
    .pipe(ps.map({ concurrent: 2 }, (...args) => {
      try {
        return callback(...args);
      } catch (e) {
        logger.error("ExtractAgent.handleExtract.error", e.stack || e);
        return Promise.reject(e);
      }
    }))
    .promise()
    .then(() => true);
}
