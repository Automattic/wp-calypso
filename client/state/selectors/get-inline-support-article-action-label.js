import { translate } from 'i18n-calypso';

import 'calypso/state/inline-support-article/init';

/**
 * @param {Object} state Global app state
 * @returns {Object} ...
 */
export default ( state ) =>
	state?.inlineSupportArticle?.actionLabel ?? translate( 'Visit article' );
