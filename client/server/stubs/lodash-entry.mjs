// Thin re-export added as a separate rolldown entry point so lodash-es gets
// its own import statement at the TOP of server.mjs (before non-entry chunks).
// Without this, lodash-es appears after chunk imports and memoize/etc. are in
// TDZ when createSelector is called during circular-dep initialization.
export * from 'lodash-es';
