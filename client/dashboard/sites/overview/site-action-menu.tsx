import { useQuery } from '@tanstack/react-query';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { isFSEActiveQuery } from '../../app/queries/site-themes';
import { getSiteEditUrl } from '../../utils/site-url';
import type { Site } from '../../data/types';

const SiteActionMenu = ( { site }: { site: Site } ) => {
	const { recordTracksEvent } = useAnalytics();
	const { data: isFSEActive, isLoading: isFSEActiveLoading } = useQuery(
		isFSEActiveQuery( site.ID )
	);

	const trackActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_sites_dashboard_site_action_menu_click', { action } );
	};

	const handleEditSite = () => {
		trackActionClick( 'edit_site' );
		window.open( getSiteEditUrl( site, isFSEActive ), '_blank' );
	};

	const handleWritePost = () => {
		trackActionClick( 'write_post' );
		window.open( `${ site.options?.admin_url }post-new.php`, '_blank' );
	};

	const handleImportSite = () => {
		trackActionClick( 'import_site' );
		window.open( addQueryArgs( '/setup/site-migration', { siteSlug: site.slug } ), '_blank' );
	};

	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => (
				<MenuGroup>
					<MenuItem disabled={ isFSEActiveLoading } onClick={ handleEditSite }>
						{ __( 'Edit site ↗' ) }
					</MenuItem>
					<MenuItem onClick={ handleWritePost }>{ __( 'Write a post ↗' ) }</MenuItem>
					<MenuItem onClick={ handleImportSite }>{ __( 'Import site ↗' ) }</MenuItem>
				</MenuGroup>
			) }
		</DropdownMenu>
	);
};

export default SiteActionMenu;
