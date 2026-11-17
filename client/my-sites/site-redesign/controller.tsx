import { type Callback } from '@automattic/calypso-router';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import SiteRedesign from './main';

export const renderSiteRedesign: Callback = ( context, next ) => {
	const state = context.store.getState();
	const { redesign } = context.query;
	const redesignId = typeof redesign === 'string' && redesign ? redesign : null;
	context.secondary = null;
	context.primary = (
		<SiteRedesign
			siteId={ getSelectedSiteId( state ) as number }
			siteSlug={ getSelectedSiteSlug( state ) as string }
			redesignId={ redesignId }
			resume={ !! redesignId && context.query.resume === 'apply' }
		/>
	);
	next();
};
