/**
 * @param {object} state Global app state
 * @returns {object} ...
 */
export default state =>
	state?.inlineSupportArticle?.actionUrl ?? state?.inlineSupportArticle?.postUrl;
