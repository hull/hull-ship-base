import Hull from "hull";

/* base utilities */
import WebApp from "../../src/app/web";
import InstrumentationAgent from "../../src/instrumentation";

/* utilities */
import { batchRouter } from "../../src/ship";

/* setup */
const hostSecret = process.env.SECRET || "1234";
const instrumentationAgent = new InstrumentationAgent();
const app = new WebApp({
  Hull,
  instrumentationAgent
});
const hullMiddleware = Hull.Middleware({ hostSecret });

app.use("/batch", batchRouter({ hullMiddleware }).callback(users => console.log(users)));

app.listenHull(8070);
