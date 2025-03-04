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

const WooPaymentsSiteSetup = ( { siteId }: { siteId: string } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const sites = useSelector( getSites );

	const { mutateAsync: installPluginToSite, isPending } = useInstallPluginToSiteMutation();
	const [ error, setError ] = useState( false );
	const [ isInstalled, setIsInstalled ] = useState( false );

	const [ selectedSite, setSelectedSite ] = useState< SiteDetails | null | undefined >( null );

	const title = translate( 'WooPayments Site Setup' );

	const onInstallPluginClick = async () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_woopayments_site_setup_install_plugin_click', {
				status: isInstalled ? 'installed' : 'not_installed',
			} )
		);

		const wooSetupUrl = `${ selectedSite?.URL }/wp-admin/admin.php?page=wc-admin&path=/payments/connect`;

		if ( isInstalled ) {
			window.open( wooSetupUrl, '_blank' );
			return;
		}

		// TODO: We need to check if the WooCommerce plugin is already installed
		const plugins = [ 'woocommerce', 'woocommerce-payments' ];

		// Install plugins sequentially
		try {
			for ( const plugin of plugins ) {
				await installPluginToSite( {
					siteId: parseInt( siteId ),
					pluginSlug: plugin,
				} );
				if ( plugin === 'woocommerce-payments' ) {
					window.open( wooSetupUrl, '_blank' );
					setIsInstalled( true );
					return;
				}
			}
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

	return (
		<Layout className="woopayments-site-setup" title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Breadcrumb
						hideOnMobile
						items={ [
							{
								label: translate( 'WooPayments Commissions' ),
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
				{ ! selectedSite ? (
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
								isNewLayout
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
												{ isInstalled
													? translate( 'View WooPayments ↗' )
													: translate( 'Install and activate the plugin ↗' ) }
											</Button>
										) }
									</>
								}
							/>
							<StepSectionItem
								isNewLayout
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
											{ translate( 'View WooPayments Commissions' ) }
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
