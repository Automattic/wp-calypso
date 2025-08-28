import { useQuery } from '@tanstack/react-query';
import { DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { isSiteUsingBlockThemeQuery } from '../../app/queries/site-themes';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import { getSiteEditUrl } from '../../utils/site-url';
import type { Site } from '../../data/types';

const SiteActionMenu = ( { site }: { site: Site } ) => {
	const { recordTracksEvent } = useAnalytics();
	const { data: isSiteUsingBlockTheme, isLoading: isSiteUsingBlockThemeLoading } = useQuery(
		isSiteUsingBlockThemeQuery( site.ID )
	);

	const trackActionClick = ( action: string ) => {
		recordTracksEvent( 'calypso_dashboard_site_action_menu_click', { action } );
	};

	const handleEditSite = () => {
		trackActionClick( 'edit-site' );
		window.open( getSiteEditUrl( site, isSiteUsingBlockTheme ), '_blank' );
	};

	const handleWritePost = () => {
		trackActionClick( 'write-post' );
		window.open( `${ site.options?.admin_url }post-new.php`, '_blank' );
	};

	const handleImportSite = () => {
		const url = isSelfHostedJetpackConnected( site )
			? 'https://wordpress.com/move'
			: addQueryArgs( '/setup/site-migration', { siteSlug: site.slug } );

		trackActionClick( 'import-site' );
		window.open( url, '_blank' );
	};

	return (
		<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
			{ () => (
				<MenuGroup>
					<MenuItem disabled={ isSiteUsingBlockThemeLoading } onClick={ handleEditSite }>
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
