import { isSupportSession } from '@automattic/calypso-support-session';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import { hasSiteTrialEnded } from '../../utils/site-trial';
import { getSiteTypeFeatureSupports } from '../../utils/site-type-feature-support';
import { isSelfHostedJetpackConnected } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

const SiteMenu = ( { site }: { site: Site } ) => {
	const { supports } = useAppContext();
	const siteSlug = site.slug;

	const siteTypeSupports = getSiteTypeFeatureSupports( site );

	if ( hasSiteTrialEnded( site ) ) {
		return (
			<ResponsiveMenu label={ __( 'Site Menu' ) } prefix={ <MenuDivider /> }>
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/trial-ended` }>
					{ __( 'Trial ended' ) }
				</ResponsiveMenu.Item>
			</ResponsiveMenu>
		);
	}

	if ( site.options?.is_difm_lite_in_progress && ! isSupportSession() ) {
		return (
			<ResponsiveMenu label={ __( 'Site Menu' ) } prefix={ <MenuDivider /> }>
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/site-building-in-progress` }>
					{ __( 'Site building' ) }
				</ResponsiveMenu.Item>
				{ siteTypeSupports.domains && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/domains` }>
						{ __( 'Domains' ) }
					</ResponsiveMenu.Item>
				) }
				{ siteTypeSupports.emails && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/emails` }>
						{ __( 'Emails' ) }
					</ResponsiveMenu.Item>
				) }
			</ResponsiveMenu>
		);
	}

	return (
		<ResponsiveMenu label={ __( 'Site Menu' ) } prefix={ <MenuDivider /> }>
			<ResponsiveMenu.Item to={ `/sites/${ siteSlug }` } activeOptions={ { exact: true } }>
				{ __( 'Overview' ) }
			</ResponsiveMenu.Item>
			{ siteTypeSupports.deployments && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/deployments` }>
					{ __( 'Deployments' ) }
				</ResponsiveMenu.Item>
			) }
			{ siteTypeSupports.performance && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/performance` }>
					{ __( 'Performance' ) }
				</ResponsiveMenu.Item>
			) }
			{ siteTypeSupports.monitoring && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/monitoring` }>
					{ __( 'Monitoring' ) }
				</ResponsiveMenu.Item>
			) }
			{ siteTypeSupports.logs && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/logs` }>
					{ __( 'Logs' ) }
				</ResponsiveMenu.Item>
			) }
			{ siteTypeSupports.scan && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/scan` }>
					{ __( 'Scan' ) }
				</ResponsiveMenu.Item>
			) }
			{ siteTypeSupports.backups && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/backups` }>
					{ __( 'Backups' ) }
				</ResponsiveMenu.Item>
			) }
			{ siteTypeSupports.domains && (
				<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/domains` }>
					{ __( 'Domains' ) }
				</ResponsiveMenu.Item>
			) }
			{ supports.sites &&
				supports.sites.settings &&
				site.capabilities?.manage_options &&
				! isSelfHostedJetpackConnected( site ) && (
					<ResponsiveMenu.Item to={ `/sites/${ siteSlug }/settings` }>
						{ __( 'Settings' ) }
					</ResponsiveMenu.Item>
				) }
		</ResponsiveMenu>
	);
};

export default SiteMenu;
