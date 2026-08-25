import page from '@automattic/calypso-router';
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
import { useWooPaymentsSiteSetup } from 'calypso/dashboard/agency/earn/woopayments/hooks/use-woopayments-site-setup';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, {
	LayoutHeaderBreadcrumb as Breadcrumb,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import { withoutHttp } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

const WooPaymentsSiteSetup = ( { siteId }: { siteId: string } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { site, isLoading, status, setupUrl, installAndActivate, isInstalling } =
		useWooPaymentsSiteSetup( parseInt( siteId ) );
	const { woocommerceStatus, woocommercePaymentsStatus, isWooPaymentsActive } = status;

	const [ error, setError ] = useState( false );
	const [ isInstalled, setIsInstalled ] = useState( false );

	const title = translate( 'WooPayments site setup' );

	const onInstallPluginClick = async () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_woopayments_site_setup_install_plugin_click', {
				status: isInstalled ? 'installed' : 'not_installed',
				woocommerceStatus,
				woocommercePaymentsStatus,
			} )
		);

		if ( isInstalled || isWooPaymentsActive ) {
			if ( setupUrl ) {
				window.open( setupUrl, '_blank' );
			}
			return;
		}

		try {
			await installAndActivate();
			if ( setupUrl ) {
				window.open( setupUrl, '_blank' );
			}
			setIsInstalled( true );
		} catch {
			setError( true );
		}
	};

	useEffect( () => {
		// Redirect to dashboard if no siteId
		if ( ! siteId ) {
			page.redirect( A4A_WOOPAYMENTS_DASHBOARD_LINK );
		}
	}, [ siteId ] );

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
				{ ! site || isLoading ? (
					<>
						<TextPlaceholder />
						<TextPlaceholder />
						<TextPlaceholder />
					</>
				) : (
					<>
						<h2 className="woopayments-site-setup__page-title">
							{ translate( 'WooPayments is now ready to be configured on %s', {
								args: withoutHttp( site.URL ),
							} ) }
						</h2>
						<div className="woopayments-site-setup__page-description">
							{ translate(
								'Follow the steps below to complete the process so you can earn commissions.'
							) }
						</div>
						<StepSection heading={ translate( 'Next steps' ) }>
							<StepSectionItem
								stepNumber={ 1 }
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
													href={ `${ site.URL }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term` }
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
												disabled={ isInstalling }
												isBusy={ isInstalling }
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
								stepNumber={ 2 }
								heading={ translate( 'Earn commissions' ) }
								description={
									<>
										<div>
											{ translate(
												"Once the plugin is installed and configured, each time a transaction occurs, you'll earn commissions!"
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
