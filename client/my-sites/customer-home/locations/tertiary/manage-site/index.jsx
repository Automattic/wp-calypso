import { createElement, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TranslatorInvite from 'calypso/components/translator-invite';
import useHomeLayoutQuery from 'calypso/data/home/use-home-layout-query';
import QuickLinks from 'calypso/my-sites/customer-home/cards/actions/quick-links';
import QuickLinksForEcommerceSites from 'calypso/my-sites/customer-home/cards/actions/quick-links-for-ecommerce-sites';
import QuickLinksForHostedSites from 'calypso/my-sites/customer-home/cards/actions/quick-links-for-hosted-sites';
import QuickPost from 'calypso/my-sites/customer-home/cards/actions/quick-post';
import WpForTeamsQuickLinks from 'calypso/my-sites/customer-home/cards/actions/wp-for-teams-quick-links';
import {
	ACTION_QUICK_LINKS,
	ACTION_QUICK_LINKS_FOR_HOSTED_SITES,
	ACTION_QUICK_POST,
	ACTION_WP_FOR_TEAMS_QUICK_LINKS,
	FEATURE_GO_MOBILE,
	FEATURE_QUICK_START,
	FEATURE_SUPPORT,
	FEATURE_SITE_PREVIEW,
	FEATURE_STATS,
	ACTION_QUICK_LINKS_FOR_ECOMMERCE_SITES,
} from 'calypso/my-sites/customer-home/cards/constants';
import AppPromo from 'calypso/my-sites/customer-home/cards/features/app-promo';
import HelpSearch from 'calypso/my-sites/customer-home/cards/features/help-search';
import QuickStart from 'calypso/my-sites/customer-home/cards/features/quick-start';
import SitePreview from 'calypso/my-sites/customer-home/cards/features/site-preview';
import Stats from 'calypso/my-sites/customer-home/cards/features/stats';
import trackMyHomeCardImpression, {
	CardLocation,
} from 'calypso/my-sites/customer-home/track-my-home-card-impression';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const cardComponents = {
	[ FEATURE_GO_MOBILE ]: AppPromo,
	[ FEATURE_SUPPORT ]: HelpSearch,
	[ FEATURE_SITE_PREVIEW ]: SitePreview,
	[ ACTION_QUICK_LINKS ]: QuickLinks,
	[ FEATURE_QUICK_START ]: QuickStart,
	[ ACTION_WP_FOR_TEAMS_QUICK_LINKS ]: WpForTeamsQuickLinks,
	[ ACTION_QUICK_LINKS_FOR_ECOMMERCE_SITES ]: QuickLinksForEcommerceSites,
	[ ACTION_QUICK_LINKS_FOR_HOSTED_SITES ]: QuickLinksForHostedSites,
	[ ACTION_QUICK_POST ]: QuickPost,
	[ FEATURE_STATS ]: Stats,
};

const ManageSite = () => {
	const cards = useManageSiteCards();

	useEffect( () => {
		if ( cards && cards.length ) {
			trackCardImpressions( cards );
		}
	}, [ cards ] );

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
			<TranslatorInvite path="/home" />
		</>
	);
};

function useManageSiteCards() {
	const siteId = useSelector( getSelectedSiteId );
	const { data: layout } = useHomeLayoutQuery( siteId, { enabled: false } );

	return layout?.[ 'tertiary.manage-site' ] ?? [];
}

function trackCardImpressions( cards ) {
	if ( ! cards || ! cards.length ) {
		return;
	}
	cards.forEach( ( card ) => {
		trackMyHomeCardImpression( { card, location: CardLocation.TERTIARY } );
	} );
}

export default ManageSite;
