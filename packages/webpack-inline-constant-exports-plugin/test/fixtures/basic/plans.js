/*
 * Export two plan constants and a a constant array of all plans. The array should not be inlined
 * and the module should stay in the dependency graph.
 */
export const BLOGGER = 'BLOGGER_PLAN';
export const PREMIUM = 'PREMIUM_PLAN';
export default [ BLOGGER, PREMIUM ];
