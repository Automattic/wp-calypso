import BlazePressWidget from 'calypso/components/blazepress-widget';
import PromotedPostsRedesignI2 from 'calypso/my-sites/promote-post-i2/main';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const promotedPosts = ( context, next ) => {
	const { tab } = context.params;
	context.primary = <PromotedPostsRedesignI2 tab={ tab } />;
	next();
};

export const promoteWidget = ( context, next ) => {
	const { item } = context.params;

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	const postId = item?.split( '-' )[ 1 ];

	context.primary = (
		<BlazePressWidget
			isVisible={ true }
			siteId={ siteId }
			postId={ postId }
			keyValue={ item }
			// source={ source }
		/>
	);

	next();
};
