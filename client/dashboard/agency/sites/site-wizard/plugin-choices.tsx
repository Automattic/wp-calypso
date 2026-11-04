import { JetpackLogo } from '@automattic/components/src/logos/jetpack-logo';
import { __ } from '@wordpress/i18n';
import { plugins, people } from '@wordpress/icons';
import A4ALogo from '../add-new-site/a4a-logo';
import { getA4APluginInstallUrl, getJetpackConnectUrl } from '../add-new-site/lib';
import ChoiceFacts from './choice-facts';
import { Choice } from './choices';

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
					<ChoiceFacts
						title={ option.title }
						facts={ [
							{
								icon: plugins,
								label:
									option.value === 'a4a'
										? __( 'Install and activate in WordPress' )
										: __( 'Install with the Jetpack installer' ),
							},
							{
								icon: people,
								label: __( 'Approve with your agency’s WordPress.com account' ),
							},
						] }
					/>
				</div>
			) ) }
		</div>
	);
}
