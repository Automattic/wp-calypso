/**
 * Returns true if the Home's Quick Links are expanded.
 *
 * @param  {object}  state   Global state tree
 * @returns {object} Whether Quick Links are expanded
 */
export default ( state ) => state.home?.quickLinksToggleStatus === 'expanded';
