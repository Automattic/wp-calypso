import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import SiteSelector from 'calypso/components/site-selector';
import { navigate } from 'calypso/lib/navigate';
import { useStore } from 'calypso/state';
import { getSiteUrl } from 'calypso/state/sites/selectors';

export function SiteSwitch( { redirectTo }: { redirectTo: string } ) {
	const { __ } = useI18n();
	const store = useStore();
	const onSiteSelect = ( siteId: number ) => {
		const state = store.getState();
		const siteUrl = getSiteUrl( state, siteId );
		navigate( siteUrl + redirectTo );
	};
	return (
		<main>
			<DocumentHead title={ __( 'Choose site' ) } />
			<p>{ __( 'Choose which site to switch to' ) }</p>
			<SiteSelector onSiteSelect={ onSiteSelect } isReskinned />
		</main>
	);
}
