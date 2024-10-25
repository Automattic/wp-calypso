import { CompactCard } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import useFetchAgencyFromBlog from 'calypso/a8c-for-agencies/data/agencies/use-fetch-agency-from-blog';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import type { SiteDetails } from '@automattic/data-stores';

export function A4AFullyManagedSiteSetting() {
	const isDevSite = false;

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

	return (
		<div className="site-settings__a4a-fully-managed-container">
			{ isDevSite ? (
				<p className="form-setting-explanation">
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
				</p>
			) : (
				<ToggleControl
					className="site-settings__a4a-fully-managed-toggle"
					label={ translate(
						'Allow clients to use the {{HcLink}}WordPress.com Help Center{{/HcLink}} and {{HfLink}}hosting features.{{/HfLink}}',
						{
							components: translationComponents,
						}
					) }
				/>
			) }
		</div>
	);
}
