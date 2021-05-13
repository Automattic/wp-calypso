/**
 * External dependencies
 */
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { isPlan } from '@automattic/calypso-products';

/**
 * Whether the user currently has any paid plans
 *
 * @param {object} state  Global state tree
 * @returns {object}       Site object
 */
export default createSelector(
	( state ) => some( getSitesItems( state ), ( site ) => isPlan( site.plan ) ),
	( state ) => [ getSitesItems( state ) ]
);
