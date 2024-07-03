import page from '@automattic/calypso-router';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import CampaignItemPage from 'calypso/my-sites/promote-post-i2/components/campaign-item-page';
import PromotedPostsRedesignI2, { TAB_OPTIONS } from 'calypso/my-sites/promote-post-i2/main';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from './utils';

// Compatibility: Checks that the order of the tab and site are correct, redirects the user if they are switched
export const checkValidTabInNavigation = ( context, next ) => {
	const { site, tab } = context.params;
	if ( site && tab && ! TAB_OPTIONS.includes( tab ) && TAB_OPTIONS.includes( site ) ) {
		return page.redirect( getAdvertisingDashboardPath( `/${ site }/${ tab }` ) );
	}

	next();
};

export const promotedPosts = ( context, next ) => {
	const { tab } = context.params;
	context.primary = <PromotedPostsRedesignI2 tab={ tab } />;
	next();
};

export const campaignDetails = ( context, next ) => {
	const { campaignId } = context.params;
	context.primary = <CampaignItemPage campaignId={ campaignId } />;
	next();
};

export const promoteWidget = ( context, next ) => {
	const { item } = context.params;

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	const postId = item?.split( '-' )[ 1 ];

	const currentQuery = getCurrentQueryArguments( state );
	const source = currentQuery?.source?.toString();

	context.primary = (
		<BlazePressWidget
			isVisible
			siteId={ siteId }
			postId={ postId }
			keyValue={ item }
			source={ source }
		/>
	);

	next();
};
