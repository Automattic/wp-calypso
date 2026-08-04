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
	const isPluginUploadFlow = ! pluginSlug && ! themeSlug;
	// The site's own plugin list, which is where an install that finished late will show up.
	const pluginsPageURL = `/plugins/${ selectedSiteSlug }`;

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
		case 'timeout':
		case 'transfer-failed': {
			// This screen also serves themes and zip uploads, so plugin-worded copy and a link to
			// the plugins list would be wrong for those. Branch on the flow.
			const isTakingTooLong = error.type === 'timeout';
			if ( themeSlug ) {
				return (
					<EmptyContent
						title={ null }
						line={
							isTakingTooLong
								? translate(
										'Installing this theme is taking longer than expected. It may still finish on its own — check your themes in a few minutes.'
								  )
								: translate(
										'We were unable to finish setting up your site for this theme. You can try again, or contact support if it keeps happening.'
								  )
						}
						secondaryAction={ translate( 'Contact support' ) }
						secondaryActionURL="/help/contact"
						action={ translate( 'Go to themes' ) }
						actionURL={ `/themes/${ selectedSiteSlug }` }
					/>
				);
			}

			return (
				<EmptyContent
					title={ null }
					line={
						isTakingTooLong
							? translate(
									'Installing this plugin is taking longer than expected. It may still finish on its own — check your installed plugins in a few minutes.'
							  )
							: translate(
									'We were unable to finish setting up your site for this plugin. You can try again, or contact support if it keeps happening.'
							  )
					}
					secondaryAction={ translate( 'Contact support' ) }
					secondaryActionURL="/help/contact"
					action={
						isPluginUploadFlow ? translate( 'Try uploading again' ) : translate( 'Go to plugins' )
					}
					actionURL={ isPluginUploadFlow ? uploadPageURL : pluginsPageURL }
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
