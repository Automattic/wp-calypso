import 'calypso/state/inline-support-article/init';

/**
 * @param {Object} state Global app state
 * @returns {Object} ...
 */
export default ( state ) =>
	state?.inlineSupportArticle?.actionUrl ?? state?.inlineSupportArticle?.postUrl;
