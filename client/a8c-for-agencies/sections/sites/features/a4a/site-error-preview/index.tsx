import { Button, CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import type { Site } from '../../../types';

import './style.scss';

export const A4A_PLUGIN_SLUG = 'automattic-for-agencies-client';
const JETPACK_PLUGIN_SLUG = 'jetpack';

export default function SiteErrorPreview( {
	site,
	trackEvent,
}: {
	site: Site;
	trackEvent: ( eventName: string ) => void;
} ) {
	const translate = useTranslate();

	const isA4APluginInstalled = site.enabled_plugin_slugs?.includes( A4A_PLUGIN_SLUG );

	const troubleshootingHref = isA4APluginInstalled
		? localizeUrl( 'https://agencieshelp.automattic.com/knowledge-base/' )
		: localizeUrl(
				'https://jetpack.com/support/getting-started-with-jetpack/fixing-jetpack-connection-issues/'
		  );

	const page = isA4APluginInstalled ? A4A_PLUGIN_SLUG : JETPACK_PLUGIN_SLUG;

	const disconnectHref = `${ site.url_with_scheme }/wp-admin/options-general.php?page=${ page }`;

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
							<Gridicon icon="external" />
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
							<Gridicon icon="external" />
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
							<Gridicon icon="external" />
						</Button>
					</FormattedHeader>
				</CompactCard>
			</div>
		</>
	);
}
