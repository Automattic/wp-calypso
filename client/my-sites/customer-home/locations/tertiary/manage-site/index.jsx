/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import GoMobile from 'my-sites/customer-home/cards/features/go-mobile';
import QuickStart from 'my-sites/customer-home/cards/features/quick-start';
import QuickLinks from 'my-sites/customer-home/cards/actions/quick-links';
import HelpSearch from 'my-sites/customer-home/cards/features/help-search';
import WpForTeamsQuickLinks from 'my-sites/customer-home/cards/actions/wp-for-teams-quick-links';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHomeLayout } from 'state/selectors/get-home-layout';
import {
	ACTION_QUICK_LINKS,
	ACTION_WP_FOR_TEAMS_QUICK_LINKS,
	FEATURE_GO_MOBILE,
	FEATURE_QUICK_START,
	FEATURE_SUPPORT,
} from 'my-sites/customer-home/cards/constants';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';

const cardComponents = {
	[ FEATURE_GO_MOBILE ]: GoMobile,
	[ FEATURE_SUPPORT ]: HelpSearch,
	[ ACTION_QUICK_LINKS ]: QuickLinks,
	[ FEATURE_QUICK_START ]: QuickStart,
	[ ACTION_WP_FOR_TEAMS_QUICK_LINKS ]: WpForTeamsQuickLinks,
};

const ManageSite = ( { cards, renderCard } ) => {
	const translate = useTranslate();

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			<h2 className="manage-site__heading customer-home__section-heading">
				{ translate( 'Manage your site' ) }
			</h2>
			{ cards.map( renderCard ) }
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const layout = getHomeLayout( state, siteId );

	return {
		cards: layout?.[ 'tertiary.manage-site' ] ?? [],
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	renderCard: ( card ) =>
		cardComponents[ card ] &&
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_card_impression', {
						card,
					} ),
					bumpStat( 'calypso_customer_home_card_impression', card )
				),
				React.createElement( cardComponents[ card ], {
					key: card,
				} )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )( ManageSite );
