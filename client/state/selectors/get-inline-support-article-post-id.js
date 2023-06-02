import 'calypso/state/inline-support-article/init';

import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @returns {Object} ...
 */
export default ( state ) => get( state, 'inlineSupportArticle.postId' );
