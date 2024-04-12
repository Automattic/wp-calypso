import { Button, Gridicon } from '@automattic/components';
import { __ } from '@wordpress/i18n';
import { useContext } from 'react';
import JetpackSitesDashboardContext from 'calypso/components/jetpack-sites-dashboard/jetpack-sites-dashboard-context';

const JetpackSitesPreviewPane = () => {
	const { sitesViewState, closeSitePreviewPane } = useContext( JetpackSitesDashboardContext );

	return (
		<div>
			<p>{ sitesViewState.selectedSiteId } preview here.</p>
			<Button
				onClick={ closeSitePreviewPane }
				className="site-preview__close-preview"
				aria-label={ __( 'Close Preview' ) }
			>
				<Gridicon icon="cross" size={ 24 } />
			</Button>
		</div>
	);
};

export default JetpackSitesPreviewPane;
