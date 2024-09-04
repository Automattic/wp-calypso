import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	site: SiteDetails;
	checked: boolean;
	onChange: ( value: boolean ) => void;
	isSaving?: boolean;
	onSaveSetting: () => void;
	disabled: boolean;
};

export function A4AFullyManagedSiteSetting( {
	site,
	checked,
	onChange,
	isSaving,
	onSaveSetting,
	disabled,
}: Props ) {
	const devSitesEnabled = config.isEnabled( 'a4a-dev-sites' );
	const isAtomicSite = site.is_wpcom_atomic;

	const { data: agencySite } = useFetchAgencyFromBlog( site?.ID, { enabled: !! site?.ID } );

	const shouldShowToggle = devSitesEnabled && agencySite && isAtomicSite;

	if ( ! shouldShowToggle ) {
		return null;
	}

	return (
		<div className="site-settings__a4a-fully-managed-container">
			<SettingsSectionHeader
				title={ translate( 'Help Center and hosting features visibility' ) }
				id="site-settings__a4a-fully-managed-header"
				disabled={ disabled }
				isSaving={ isSaving }
				onButtonClick={ onSaveSetting }
				showButton
			/>
			<CompactCard className="site-settings__a4a-fully-managed-content">
				<ToggleControl
					disabled={ disabled }
					className="site-settings__a4a-fully-managed-toggle"
					label={ translate(
						'Allow clients to use the {{HcLink}}WordPress.com Help Center{{/HcLink}} and {{HfLink}}hosting features.{{/HfLink}}',
						{
							components: {
								HcLink: (
									<a
										target="_blank"
										href={ localizeUrl(
											'https://wordpress.com/support/help-support-options/#how-to-contact-us'
										) }
										rel="noreferrer"
									/>
								),
								HfLink: (
									<a
										target="_blank"
										href={ localizeUrl(
											'https://developer.wordpress.com/docs/developer-tools/web-server-settings/'
										) }
										rel="noreferrer"
									/>
								),
							},
						}
					) }
					checked={ checked }
					onChange={ onChange }
				/>
			</CompactCard>
		</div>
	);
}
