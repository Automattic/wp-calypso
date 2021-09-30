import { createElement, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import QuickLinks from 'calypso/my-sites/customer-home/cards/actions/quick-links';
import WpForTeamsQuickLinks from 'calypso/my-sites/customer-home/cards/actions/wp-for-teams-quick-links';
import {
	ACTION_QUICK_LINKS,
	ACTION_WP_FOR_TEAMS_QUICK_LINKS,
	FEATURE_GO_MOBILE,
	FEATURE_QUICK_START,
	FEATURE_SUPPORT,
} from 'calypso/my-sites/customer-home/cards/constants';
import GoMobile from 'calypso/my-sites/customer-home/cards/features/go-mobile';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import QuickStart from 'calypso/my-sites/customer-home/cards/features/quick-start';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const cardComponents = {
	[ FEATURE_GO_MOBILE ]: GoMobile,
	[ FEATURE_SUPPORT ]: HelpSearch,
	[ ACTION_QUICK_LINKS ]: QuickLinks,
	[ FEATURE_QUICK_START ]: QuickStart,
	[ ACTION_WP_FOR_TEAMS_QUICK_LINKS ]: WpForTeamsQuickLinks,
};

const ManageSite = () => {
	const cards = useManageSiteCards();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( cards && cards.length ) {
			dispatch( trackCardImpressions( cards ) );
		}
	}, [ cards, dispatch ] );

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			{ cards.map(
				( card, index ) =>
					cardComponents[ card ] &&
					createElement( cardComponents[ card ], {
						key: index,
					} )
			) }
		</>
	);
};

function useManageSiteCards() {
	const siteId = useSelector( getSelectedSiteId );
	const { data: layout } = useHomeLayoutQuery( siteId, { enabled: false } );

	return layout?.[ 'tertiary.manage-site' ] ?? [];
}

function trackCardImpressions( cards ) {
	const analyticsEvents = cards.reduce( ( events, card ) => {
		return [
			...events,
			recordTracksEvent( 'calypso_customer_home_card_impression', { card } ),
			bumpStat( 'calypso_customer_home_card_impression', card ),
		];
	}, [] );
	return composeAnalytics( ...analyticsEvents );
}

export default ManageSite;
