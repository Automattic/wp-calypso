import { Button, CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Icon, external, trash } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import useRemoveSiteMutation from 'calypso/a8c-for-agencies/data/sites/use-remove-site';
import FormattedHeader from 'calypso/components/formatted-header';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { SiteRemoveConfirmationDialog } from '../../../site-remove-confirmation-dialog';
import type { Site } from '../../../types';

import './style.scss';

export const A4A_PLUGIN_SLUG = 'automattic-for-agencies-client';
const JETPACK_PLUGIN_SLUG = 'jetpack';

export default function SiteErrorPreview( {
	site,
	trackEvent,
	onRefetchSite,
	closeSitePreviewPane,
}: {
	site: Site;
	trackEvent: ( eventName: string ) => void;
	onRefetchSite?: () => Promise< unknown >;
	closeSitePreviewPane?: () => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ showRemoveSiteDialog, setShowRemoveSiteDialog ] = useState( false );
	const [ isPendingRefetch, setIsPendingRefetch ] = useState( false );

	const { mutate: removeSite, isPending } = useRemoveSiteMutation();

	const onRemoveSite = useCallback( () => {
		if ( site.a4a_site_id ) {
			removeSite(
				{ siteId: site.a4a_site_id },
				{
					onSuccess: () => {
						setIsPendingRefetch( true );
						// Add 1 second delay to refetch sites to give time for site profile to be reindexed properly.
						setTimeout( () => {
							onRefetchSite?.()?.then( () => {
								setIsPendingRefetch( false );
								setShowRemoveSiteDialog( false );
								dispatch(
									successNotice( translate( 'The site has been successfully removed.' ), {
										displayOnNextPage: true,
									} )
								);
								closeSitePreviewPane?.();
							} );
						}, 1000 );
					},
				}
			);
		}
	}, [ closeSitePreviewPane, dispatch, onRefetchSite, removeSite, site.a4a_site_id, translate ] );

	const isA4APluginInstalled = site.enabled_plugin_slugs?.includes( A4A_PLUGIN_SLUG );

	const troubleshootingHref = isA4APluginInstalled
		? localizeUrl(
				'https://agencieshelp.automattic.com/knowledge-base/fix-automattic-for-agencies-plugin-issues/'
		  )
		: localizeUrl(
				'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/'
		  );

	const page = isA4APluginInstalled ? A4A_PLUGIN_SLUG : JETPACK_PLUGIN_SLUG;

	const disconnectHref = `${ site.url_with_scheme }/wp-admin/options-general.php?page=${ page }`;

	const handleRemoveSite = () => {
		trackEvent( 'calypso_a4a_site_indicator_disconnect_remove_site' );
		setShowRemoveSiteDialog( true );
	};

	return (
		<>
			<div className="site-error-preview__title">
				{ isA4APluginInstalled
					? translate( "Automattic for Agencies can't connect to this site." )
					: translate( "Jetpack can't connect to this site." ) }
			</div>
			<div className="site-error-preview__description">
				{ translate( "Try the following steps to fix your site's connection:" ) }
			</div>
			<div className="site-error-preview__actions">
				<CompactCard>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Confirm that your site loads' ) }
						subHeaderText={
							isA4APluginInstalled
								? translate(
										"Visit your site to make sure it loads properly. If there's an issue, fix your site before worrying about Automattic for Agencies! That may resolve this error."
								  )
								: translate(
										"Visit your site to make sure it loads properly. If there's an issue, fix your site before worrying about Jetpack! That may resolve this error."
								  )
						}
					>
						<Button
							href={ site.url_with_scheme }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () => trackEvent( 'calypso_a4a_site_indicator_disconnect_confirm' ) }
						>
							{ translate( 'Confirm now' ) }
							<Icon icon={ external } />
						</Button>
					</FormattedHeader>
				</CompactCard>
				<CompactCard>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={
							isA4APluginInstalled
								? translate( 'Troubleshoot Automattic for Agencies' )
								: translate( 'Troubleshoot Jetpack' )
						}
						subHeaderText={
							isA4APluginInstalled
								? translate(
										"If your site is loading but you're still seeing this error, this guide will help you troubleshoot the Automattic for Agencies connection."
								  )
								: translate(
										"If your site is loading but you're still seeing this error, this guide will help you troubleshoot the Jetpack connection."
								  )
						}
					>
						<Button
							href={ troubleshootingHref }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () => trackEvent( 'calypso_a4a_site_indicator_disconnect_troubleshoot' ) }
						>
							{ translate( 'View guide' ) }
							<Icon icon={ external } />
						</Button>
					</FormattedHeader>
				</CompactCard>
				<CompactCard>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={
							isA4APluginInstalled
								? translate( 'Disconnect Automattic for Agencies' )
								: translate( 'Disconnect Jetpack' )
						}
						subHeaderText={
							isA4APluginInstalled
								? translate(
										"If you're no longer using Automattic for Agencies and/or WordPress for your site, or you've taken your site down, it's time to disconnect Automattic for Agencies."
								  )
								: translate(
										"If you're no longer using Jetpack and/or WordPress for your site, or you've taken your site down, it's time to disconnect Jetpack."
								  )
						}
					>
						<Button
							href={ disconnectHref }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () => trackEvent( 'calypso_a4a_site_indicator_disconnect_disconnect' ) }
						>
							{ translate( 'Disconnect' ) }
							<Icon icon={ external } />
						</Button>
					</FormattedHeader>
				</CompactCard>
				<CompactCard>
					<FormattedHeader
						isSecondary
						align="left"
						headerText={ translate( 'Remove site' ) }
						subHeaderText={ translate( 'Remove this site from the dashboard.' ) }
					>
						<Button onClick={ handleRemoveSite }>
							{ translate( 'Remove' ) }
							<Icon icon={ trash } />
						</Button>
					</FormattedHeader>
				</CompactCard>
			</div>
			{ showRemoveSiteDialog && (
				<SiteRemoveConfirmationDialog
					siteName={ site.url }
					onClose={ () => setShowRemoveSiteDialog( false ) }
					onConfirm={ onRemoveSite }
					busy={ isPending || isPendingRefetch }
				/>
			) }
		</>
	);
}
