import { Button, __experimentalHeading as Heading } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { getA4APluginInstallUrl, getJetpackConnectUrl } from '../add-new-site/lib';
import PluginChoices from './plugin-choices';
import SitePreview from './site-preview';
import type { IntakeSite } from './site-intake';
import type { Site } from '@automattic/api-core';

interface ConnectionSitesProps {
	sites: IntakeSite[];
	knownSite?: Site;
	plugin: 'a4a' | 'jetpack';
	simulate: boolean;
	showInstallers?: boolean;
}

export function ConnectionSites( {
	sites,
	knownSite,
	plugin,
	simulate,
	showInstallers,
}: ConnectionSitesProps ) {
	return (
		<div className="agency-site-wizard__connection-sites">
			{ sites.length === 1 ? (
				<SitePreview
					site={ sites[ 0 ] }
					knownSite={ knownSite }
					simulate={ simulate }
					size="large"
				/>
			) : (
				<>
					<Heading level={ 3 }>
						{ sprintf(
							/* translators: %d is the number of sites. */
							__( '%d sites to connect' ),
							sites.length
						) }
					</Heading>
					<ul className="agency-site-wizard__batch-list">
						{ sites.map( ( site ) => (
							<li key={ site.id }>
								<strong>{ site.name }</strong>
								{ site.name !== new URL( site.url ).hostname && <bdi>{ site.url }</bdi> }
								{ showInstallers && ! simulate && (
									<Button
										variant="link"
										href={
											( plugin === 'a4a'
												? getA4APluginInstallUrl( site.url )
												: getJetpackConnectUrl( site.url ) ) ?? undefined
										}
										target="_blank"
										rel="noreferrer"
									>
										{ sprintf(
											/* translators: %s is the website name. */
											__( 'Connect %s' ),
											site.name
										) }
									</Button>
								) }
							</li>
						) ) }
					</ul>
				</>
			) }
		</div>
	);
}

export function ConnectionInstructions( { plugin }: { plugin: 'a4a' | 'jetpack' } ) {
	const pluginName = plugin === 'a4a' ? 'Automattic for Agencies' : 'Jetpack';
	return (
		<ol className="agency-site-wizard__connection-steps">
			<li>
				<Heading level={ 3 }>
					{ sprintf(
						/* translators: %s is the plugin name. */
						__( 'Install and activate %s' ),
						pluginName
					) }
				</Heading>
				<p>
					{ plugin === 'a4a'
						? __( 'Sign in to your site’s WordPress admin, then choose Install Now and Activate.' )
						: __(
								'Enter your site’s administrator credentials in the Jetpack installer to install the plugin.'
							) }
				</p>
			</li>
			<li>
				<Heading level={ 3 }>{ __( 'Link your agency account' ) }</Heading>
				<p>
					{ plugin === 'a4a'
						? __(
								'Choose “Connect this site”, then approve the WordPress.com account you use for your agency.'
							)
						: __(
								'Approve the connection with the WordPress.com account you use for your agency.'
							) }
				</p>
			</li>
		</ol>
	);
}

export default function ConnectionSetup( {
	onPluginSelect,
	...props
}: ConnectionSitesProps & { onPluginSelect: ( plugin: 'a4a' | 'jetpack' ) => void } ) {
	return (
		<div className="agency-site-wizard__connection-layout">
			<div className="agency-site-wizard__connection">
				<ConnectionSites { ...props } />
			</div>
			{ ! props.knownSite && (
				<PluginChoices
					onSelect={ onPluginSelect }
					installerSiteUrl={
						! props.simulate && props.sites.length === 1 ? props.sites[ 0 ].url : undefined
					}
				/>
			) }
		</div>
	);
}
