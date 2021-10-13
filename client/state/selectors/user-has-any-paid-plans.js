import { isPlan } from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import { some } from 'lodash';
import getSitesItems from 'calypso/state/selectors/get-sites-items';

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
