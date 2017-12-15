/**
 * Returns the ID of the site that is currently in the Jetpack Onboarding flow.
 *
 * @param  {Object}  state Global state tree
 * @return {?Number}       Jetpack Onboarding site ID
 */
export default state => state.ui.jetpackOnboardingSiteId;
