import { getSelectedSite } from 'calypso/state/ui/selectors';
import UpgradeJetpack from './main';
import type { Context } from '@automattic/calypso-router';

export default async function renderUpgradeJetpack( context: Context, next: () => void ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <UpgradeJetpack key={ site?.ID } />;

	next();
}
