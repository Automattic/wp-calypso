/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

export const getCommentsProgresses = ( state, siteId ) =>
	get( state, [ 'ui', 'comments', 'progresses', siteId ], {} );

export default getCommentsProgresses;
