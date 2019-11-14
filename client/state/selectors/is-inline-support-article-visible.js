/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * @param {Object} state Global app state
 * @return {Object} ...
 */
export default state => get( state, 'inlineSupportArticle.isVisible', false );
