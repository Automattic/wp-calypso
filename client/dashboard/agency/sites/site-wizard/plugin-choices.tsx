import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { __ } from '@wordpress/i18n';
import A4ALogo from '../add-new-site/a4a-logo';
import { getA4APluginInstallUrl, getJetpackConnectUrl } from '../add-new-site/lib';
import { Choice } from './choices';
import FeatureChecklist from './feature-checklist';

export default function PluginChoices( {
	onSelect,
	installerSiteUrl,
}: {
	onSelect: ( plugin: 'a4a' | 'jetpack' ) => void;
	installerSiteUrl?: string;
} ) {
	const options = [
		{
			value: 'a4a' as const,
			title: __( 'Automattic for Agencies' ),
			description: __( 'A lightweight connection to your agency dashboard.' ),
			logo: <A4ALogo size={ 48 } />,
			href: installerSiteUrl ? getA4APluginInstallUrl( installerSiteUrl ) : undefined,
		},
		{
			value: 'jetpack' as const,
			title: __( 'Jetpack' ),
			description: __( 'Install Jetpack and connect your site through its guided setup.' ),
			logo: <JetpackLogo size={ 48 } />,
			href: installerSiteUrl ? getJetpackConnectUrl( installerSiteUrl ) : undefined,
		},
	];
	return (
		<div className="agency-site-wizard__choices agency-site-wizard__entry-options">
			{ options.map( ( option ) => (
				<div className="agency-site-wizard__entry-option" key={ option.value }>
					<Choice
						title={ option.title }
						description={ option.description }
						onClick={ () => onSelect( option.value ) }
						href={ option.href ?? undefined }
						illustration={
							<span className="agency-site-wizard__plugin-logo" aria-hidden="true">
								{ option.logo }
							</span>
						}
					/>
					<FeatureChecklist
						title={ option.title }
						features={ [
							{
								label:
									option.value === 'a4a'
										? __( 'Install and activate in WordPress' )
										: __( 'Install through Jetpack' ),
								detail:
									option.value === 'jetpack'
										? __(
												'Enter your site’s administrator credentials in the Jetpack installer to install the plugin.'
											)
										: __(
												'Sign in to your site’s WordPress admin, then choose Install Now and Activate for Automattic for Agencies.'
											),
							},
							{
								label: __( 'Approve your agency account' ),
								detail:
									option.value === 'jetpack'
										? __(
												'Approve the connection with the WordPress.com account you use for your agency.'
											)
										: __(
												'Choose “Connect this site”, then approve the WordPress.com account you use for your agency.'
											),
							},
						] }
					/>
				</div>
			) ) }
		</div>
	);
}
