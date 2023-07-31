import BlazePressWidget from 'calypso/components/blazepress-widget';
import CampaignItemPage from 'calypso/my-sites/promote-post-i2/components/campaign-item-page';
import PromotedPostsRedesignI2 from 'calypso/my-sites/promote-post-i2/main';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
			isVisible={ true }
			siteId={ siteId }
			postId={ postId }
			keyValue={ item }
			source={ source }
		/>
	);

	next();
};
