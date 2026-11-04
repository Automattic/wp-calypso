import { type Callback } from '@automattic/calypso-router';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import SiteRedesign from './main';

export const renderSiteRedesign: Callback = ( context, next ) => {
	const state = context.store.getState();
	const { redesign, ref } = context.query;
	const redesignId = typeof redesign === 'string' && redesign ? redesign : null;
	// Where the owner came from, such as `marketing_bar`, for the Tracks funnel.
	const entryRef = typeof ref === 'string' && /^[a-z0-9_]{1,32}$/.test( ref ) ? ref : null;
	context.secondary = null;
	context.primary = (
		<SiteRedesign
			siteId={ getSelectedSiteId( state ) as number }
			siteSlug={ getSelectedSiteSlug( state ) as string }
			redesignId={ redesignId }
			resume={ !! redesignId && context.query.resume === 'apply' }
			entryRef={ entryRef }
		/>
	);
	next();
};
