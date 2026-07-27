import { PLAN_BUSINESS, getPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import { useSelector } from 'calypso/state';
import { getTheme } from 'calypso/state/themes/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ThemeDirectInstall from './theme-direct-install';
import type { ProductInstallError } from './use-product-install';

export default function ProductInstallErrorView( {
	error,
	pluginSlug,
	themeSlug,
	onActivateTheme,
}: {
	error: ProductInstallError;
	pluginSlug: string;
	themeSlug: string;
	onActivateTheme: () => void;
} ) {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const wpOrgTheme = useSelector( ( state ) => getTheme( state, 'wporg', themeSlug ) );

	const uploadPageURL = `/plugins/upload/${ selectedSiteSlug }`;
	const wpAdminUploadURL = `https://${ selectedSiteSlug }/wp-admin/plugin-install.php?tab=upload`;

	switch ( error.type ) {
		case 'non-installable-plan': {
			const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
			return (
				<EmptyContent
					title={ null }
					line={ translate(
						"Your current plan doesn't allow plugin installation. Please upgrade to %(businessPlanName)s plan first.",
						{
							args: { businessPlanName },
						}
					) }
					action={ translate( 'Upgrade to %(planName)s Plan', {
						args: { planName: businessPlanName },
					} ) }
					actionURL={ `/checkout/${ selectedSite?.slug }/business?redirect_to=/marketplace/plugin/${ pluginSlug }/install/${ selectedSite?.slug }#step2` }
				/>
			);
		}
		case 'no-direct-access-upload':
			return (
				<EmptyContent
					title={ null }
					line={ translate(
						'This URL should not be accessed directly. Please try to upload the plugin again.'
					) }
					action={ translate( 'Go to the upload page' ) }
					actionURL={ `/plugins/upload/${ selectedSite?.slug }` }
				/>
			);
		case 'theme-direct-install':
			return (
				<ThemeDirectInstall
					themeSlug={ themeSlug }
					pluginSlug={ pluginSlug }
					siteSlug={ selectedSite?.slug }
					theme={ wpOrgTheme }
					onActivate={ onActivateTheme }
				/>
			);
		case 'rejected-upload': {
			// Separate translate() calls per reason so the strings stay extractable.
			let line;
			switch ( error.reason ) {
				case 'exists':
					line = translate(
						'This plugin already exists on your site. If you want to upgrade or downgrade the plugin, please continue by uploading the plugin again from WP Admin.'
					);
					break;
				case 'malicious':
					line = translate(
						'This plugin is identified as malicious. If you still insist to install the plugin, please continue by uploading the plugin again from WP Admin.'
					);
					break;
				case 'too-big':
					line = translate(
						'This plugin is too big to be installed via this page. If you still want to install the plugin, please continue by uploading the plugin again from WP Admin.'
					);
					break;
			}
			return (
				<EmptyContent
					title={ null }
					line={ line }
					secondaryAction={ translate( 'Back' ) }
					secondaryActionURL={ uploadPageURL }
					action={ translate( 'Re-upload plugin' ) }
					actionURL={ wpAdminUploadURL }
				/>
			);
		}
		case 'generic':
			return (
				<EmptyContent
					title={ null }
					line={ translate(
						'An error occurred while installing the plugin. Please try uploading it again from WP Admin.'
					) }
					secondaryAction={ translate( 'Back' ) }
					secondaryActionURL={
						! pluginSlug && ! themeSlug
							? uploadPageURL
							: `/plugins/${ pluginSlug }/${ selectedSiteSlug }`
					}
					action={ translate( 'Upload from WP Admin' ) }
					actionURL={ wpAdminUploadURL }
				/>
			);
	}
}
