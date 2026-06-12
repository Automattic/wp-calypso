import { getSelectedSite } from 'calypso/state/ui/selectors';
import UpgradeJetpack from './main';

export default async function renderUpgradeJetpack( context: PageJS.Context, next: () => void ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <UpgradeJetpack key={ site?.ID } />;

	next();
}
