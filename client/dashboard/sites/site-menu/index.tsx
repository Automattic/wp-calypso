import { __ } from '@wordpress/i18n';
import { isSupportSession } from '../../app/auth/support-session';
import { useAppContext } from '../../app/context';
import ResponsiveMenu from '../../components/responsive-menu';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import type { AppConfig, SiteFeatureSupports } from '../../app/context';
import type { Site } from '../../data/types';

const hasAppSupport = ( supports: AppConfig[ 'supports' ], feature: keyof SiteFeatureSupports ) => {
	return supports.sites && supports.sites[ feature ];
};

const SiteMenu = ( { site }: { site: Site } ) => {
	const { supports } = useAppContext();
	const siteSlug = site.slug;

	if ( hasSiteTrialEnded( site ) ) {
		return (
			<ResponsiveMenu label={ __( 'Site Menu' ) }>
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/trial-ended` }>
					{ __( 'Trial ended' ) }
				</ResponsiveMenu.Item>
			</ResponsiveMenu>
		);
	}

	if ( site.options?.is_difm_lite_in_progress && ! isSupportSession() ) {
		return (
			<ResponsiveMenu label={ __( 'Site Menu' ) }>
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/site-building-in-progress` }>
					{ __( 'Site building' ) }
				</ResponsiveMenu.Item>
				{ hasAppSupport( supports, 'domains' ) && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/domains` }>
						{ __( 'Domains' ) }
					</ResponsiveMenu.Item>
				) }
				{ hasAppSupport( supports, 'emails' ) && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/emails` }>
						{ __( 'Emails' ) }
					</ResponsiveMenu.Item>
				) }
			</ResponsiveMenu>
		);
	}

	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) }>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }` } activeOptions={ { exact: true } }>
				{ __( 'Overview' ) }
			</ResponsiveMenu.Item>
			{ hasAppSupport( supports, 'deployments' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/deployments` }>
					{ __( 'Deployments' ) }
				</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'performance' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/performance` }>
					{ __( 'Performance' ) }
				</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'monitoring' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/monitoring` }>
					{ __( 'Monitoring' ) }
				</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'logs' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/logs` }>
					{ __( 'Logs' ) }
				</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'backups' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/backups` }>
					{ __( 'Backups' ) }
				</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'domains' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/domains` }>
					{ __( 'Domains' ) }
				</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'emails' ) && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/emails` }>
					{ __( 'Emails' ) }
				</ResponsiveMenu.Item>
			) }
			{ site.capabilities.manage_options && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/settings` }>
					{ __( 'Settings' ) }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default SiteMenu;
