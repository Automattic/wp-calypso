/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Courses from './courses';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer
} from 'state/purchases/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';

function mapStateToProps( state ) {
	const userId = getCurrentUserId( state );
	const purchases = getUserPurchases( state, userId );
	const isBusinessPlanUser = purchases && !! find( purchases, purchase => purchase.productSlug === PLAN_BUSINESS );
	const isLoading = ! hasLoadedUserPurchasesFromServer( state );

	return {
		isLoading,
		isBusinessPlanUser,
		userId
	};
}

export default connect( mapStateToProps )( localize( Courses ) );
