// A transfer reports `completed` once the software job is queued, so the site answers as Atomic a
// moment later. Past this the wait has stopped being informative and needs an ending.
export const ACTIVATION_DEADLINE_MS = 2 * 60 * 1000;
