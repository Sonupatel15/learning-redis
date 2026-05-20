import { Worker } from "bullmq";
import { connection } from "./queue.js";

const worker = new Worker(
  "emails",

  async (job) => {
    console.log(
      "Processing email job...",
      job.id,
      job.name,
      job.data
    );

    // fake email delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    console.log(
      "Email job Complete",
      job.id,
      job.name,
      job.data
    );
  },

  { connection }
);

worker.on("completed", (job) => {
  console.log(
    "Job Completed",
    job.id
  );
});

worker.on(
  "failed",
  (job, err) => {
    console.log(
      "Job Failed",
      job?.id,
      err.message
    );
  }
);