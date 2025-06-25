import page from '@automattic/calypso-router';
import { SiteDetails } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { A4A_WOOPAYMENTS_DASHBOARD_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import StepSection from 'calypso/a8c-for-agencies/components/step-section';
import StepSectionItem from 'calypso/a8c-for-agencies/components/step-section-item';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useFetchSitePlugins from 'calypso/a8c-for-agencies/data/sites/use-fetch-site-plugins';
import useActivatePluginToSiteMutation from 'calypso/a8c-for-agencies/hooks/use-activate-plugin-to-site';
import useInstallPluginToSiteMutation from 'calypso/a8c-for-agencies/hooks/use-install-plugin-to-site';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSites from 'calypso/state/selectors/get-sites';

import './style.scss';

const WOOCOMMERCE_PLUGIN_SLUG = 'woocommerce/woocommerce';
const WOOCOMMERCE_PAYMENTS_PLUGIN_SLUG = 'woocommerce-payments/woocommerce-payments';

const WooPaymentsSiteSetup = ( { siteId }: { siteId: string } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const sites = useSelector( getSites );

	const { mutateAsync: installPluginToSite, isPending: isPendingInstall } =
		useInstallPluginToSiteMutation();
	const { mutateAsync: activatePluginToSite, isPending: isPendingActivate } =
		useActivatePluginToSiteMutation();
	const [ error, setError ] = useState( false );
	const [ isInstalled, setIsInstalled ] = useState( false );

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

	const { data: plugins, isLoading: isLoadingPlugins } = useFetchSitePlugins( parseInt( siteId ) );

	const woocommercePlugin = plugins?.find(
		( { plugin }: { plugin: string } ) => plugin === 'woocommerce/woocommerce'
	);

	const woocommerceStatus = woocommercePlugin?.status;
	const isWooCommerceInactive = woocommerceStatus === 'inactive';

	const woocommercePaymentsPlugin = plugins?.find(
		( { plugin }: { plugin: string } ) => plugin === 'woocommerce-payments/woocommerce-payments'
	);

	const woocommercePaymentsStatus = woocommercePaymentsPlugin?.status;
	const isWooPaymentsActive = woocommercePaymentsStatus === 'active';
	const isWooPaymentsInactive = woocommercePaymentsStatus === 'inactive';

	const title = translate( 'WooPayments Site Setup' );

	const onInstallPluginClick = async () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_woopayments_site_setup_install_plugin_click', {
				status: isInstalled ? 'installed' : 'not_installed',
				woocommerceStatus,
				woocommercePaymentsStatus,
			} )
		);

		const wooSetupUrl = `${ selectedSite?.URL }/wp-admin/admin.php?page=wc-admin&path=/payments/connect`;

		if ( isInstalled || isWooPaymentsActive ) {
			window.open( wooSetupUrl, '_blank' );
			return;
		}

		try {
			// Install WooCommerce if not installed
			if ( ! woocommercePlugin ) {
				await installPluginToSite( {
					siteId: parseInt( siteId ),
					pluginSlug: 'woocommerce',
				} );
			}

			// Activate WooCommerce if it is installed but inactive
			if ( isWooCommerceInactive ) {
				await activatePluginToSite( {
					siteId: parseInt( siteId ),
					pluginSlug: WOOCOMMERCE_PLUGIN_SLUG,
				} );
			}

			// Install WooPayments if not installed
			if ( ! woocommercePaymentsPlugin ) {
				await installPluginToSite( {
					siteId: parseInt( siteId ),
					pluginSlug: 'woocommerce-payments',
				} );
			}

			// Activate WooPayments if it is installed but inactive
			if ( isWooPaymentsInactive ) {
				await activatePluginToSite( {
					siteId: parseInt( siteId ),
					pluginSlug: WOOCOMMERCE_PAYMENTS_PLUGIN_SLUG,
				} );
			}
			// Open WooPayments setup page
			window.open( wooSetupUrl, '_blank' );
			setIsInstalled( true );
		} catch {
			setError( true );
		}
	};

	useEffect( () => {
		// Redirect to dashboard if no siteId
		if ( ! siteId ) {
			page.redirect( A4A_WOOPAYMENTS_DASHBOARD_LINK );
			return;
		}

		// Find matching site
		const site = sites.find( ( site ) => site?.ID === parseInt( siteId ) );

		if ( site ) {
			// Set selected site and remove site_id param
			setSelectedSite( site );
			return;
		}
	}, [ siteId, sites ] );

	const isPending = isPendingInstall || isPendingActivate;

	return (
		<Layout className="woopayments-site-setup" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'WooPayments commissions' ),
								href: A4A_WOOPAYMENTS_DASHBOARD_LINK,
							},
							{
								label: translate( 'Site setup' ),
							},
						] }
					/>
					<Actions>
						<MobileSidebarNavigation />
					</Actions>
				</LayoutHeader>
			</LayoutTop>

			<LayoutBody>
				{ ! selectedSite || isLoadingPlugins ? (
					<>
						<TextPlaceholder />
						<TextPlaceholder />
						<TextPlaceholder />
					</>
				) : (
					<>
						<h2 className="woopayments-site-setup__page-title">
							{ translate( 'WooPayments is now ready to be configured on %s', {
								args: selectedSite?.domain,
							} ) }
						</h2>
						<div className="woopayments-site-setup__page-description">
							{ translate(
								'Follow the steps below to complete the process so you can earn commissions.'
							) }
						</div>
						<StepSection heading={ translate( 'Next steps' ) }>
							<StepSectionItem
								heading={ translate( 'Install and activate the plugin on WP-Admin' ) }
								description={
									<>
										<div>
											{ translate(
												"Click the button and we'll automatically install and activate the plugin for you. Then we'll launch WP-Admin so you can configure the final steps."
											) }
										</div>
										{ error ? (
											<>
												<div className="woopayments-site-setup__error">
													{ translate(
														"We're sorry, we weren't able to install WooPayments on your site. Visit your WP-Admin to set up."
													) }
												</div>
												<Button
													variant="primary"
													href={ `${ selectedSite.URL }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term` }
													target="_blank"
													rel="noopener noreferrer"
													onClick={ () => {
														dispatch(
															recordTracksEvent(
																'calypso_a4a_woopayments_site_setup_install_plugin_error_click'
															)
														);
													} }
												>
													{ translate( 'Visit WP-Admin ↗' ) }
												</Button>
											</>
										) : (
											<Button
												disabled={ isPending }
												isBusy={ isPending }
												variant="primary"
												onClick={ onInstallPluginClick }
											>
												{ isInstalled || isWooPaymentsActive
													? translate( 'Finish setup ↗' )
													: translate( 'Install and activate the plugin ↗' ) }
											</Button>
										) }
									</>
								}
							/>
							<StepSectionItem
								heading={ translate( 'Earn commissions' ) }
								description={
									<>
										<div>
											{ translate(
												"Once the plugin is installed and configured, each time a transaction occurs, you'll earn commisions!"
											) }
										</div>
										<Button
											variant="secondary"
											onClick={ () => {
												dispatch(
													recordTracksEvent(
														'calypso_a4a_woopayments_site_setup_view_commissions_click'
													)
												);
											} }
											href={ A4A_WOOPAYMENTS_DASHBOARD_LINK }
										>
											{ translate( 'View WooPayments commissions' ) }
										</Button>
									</>
								}
							/>
						</StepSection>
					</>
				) }
			</LayoutBody>
		</Layout>
	);
};

export default WooPaymentsSiteSetup;
