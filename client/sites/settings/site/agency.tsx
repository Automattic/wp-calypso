import { Button, CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { useIsSiteSettingsUntangled } from '../hooks/use-is-site-settings-untangled';
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	site: SiteDetails;
	isFullyManagedAgencySite: boolean;
	onChange: ( value: boolean ) => void;
	isSaving?: boolean;
	onSaveSetting: () => void;
	disabled: boolean;
};

export function A4AFullyManagedSiteForm( {
	site,
	isFullyManagedAgencySite,
	onChange,
	isSaving,
	onSaveSetting,
	disabled,
}: Props ) {
	const isDevSite = site.is_a4a_dev_site;
	const isAtomicSite = site.is_wpcom_atomic;

	const isUntangled = useIsSiteSettingsUntangled();

	const { data: agencySite } = useFetchAgencyFromBlog( site?.ID, { enabled: !! site?.ID } );

	const shouldShowToggle = agencySite && isAtomicSite;

	if ( ! shouldShowToggle ) {
		return null;
	}

	const translationComponents = {
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
	};

	const renderContent = () => {
		return (
			<>
				{ isDevSite ? (
					<FormSettingExplanation>
						{ translate(
							"Clients can't access the {{HcLink}}WordPress.com Help Center{{/HcLink}} or {{HfLink}}hosting features{{/HfLink}} on development sites. You may configure access after the site is launched.",
							{
								components: translationComponents,
							}
						) }{ ' ' }
						{ translate( '{{a}}Learn more.{{/a}}', {
							components: {
								a: (
									<a
										target="_blank"
										href={ localizeUrl(
											'https://agencieshelp.automattic.com/knowledge-base/free-development-licenses-for-wordpress-com-hosting/'
										) }
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</FormSettingExplanation>
				) : (
					<ToggleControl
						disabled={ disabled }
						className="site-settings__a4a-fully-managed-toggle"
						label={ translate(
							'Allow clients to use the {{HcLink}}WordPress.com Help Center{{/HcLink}} and {{HfLink}}hosting features.{{/HfLink}}',
							{
								components: translationComponents,
							}
						) }
						checked={ ! isFullyManagedAgencySite }
						onChange={ ( checked ) => onChange( ! checked ) }
					/>
				) }
			</>
		);
	};

	if ( ! isUntangled ) {
		return (
			<div className="site-settings__a4a-fully-managed-container">
				<SettingsSectionHeader
					title={ translate( 'Agency settings' ) }
					id="site-settings__a4a-fully-managed-header"
					disabled={ disabled }
					isSaving={ isSaving }
					onButtonClick={ onSaveSetting }
					showButton={ ! isDevSite }
				/>
				<CompactCard className="site-settings__a4a-fully-managed-content">
					{ renderContent() }
				</CompactCard>
			</div>
		);
	}

	return (
		<PanelCard>
			<PanelCardHeading id="site-settings__a4a-fully-managed-header">
				{ translate( 'Agency settings' ) }
			</PanelCardHeading>
			{ renderContent() }
			{ ! isDevSite && (
				<Button onClick={ onSaveSetting } busy={ isSaving } disabled={ disabled }>
					{ translate( 'Save' ) }
				</Button>
			) }
		</PanelCard>
	);
}
