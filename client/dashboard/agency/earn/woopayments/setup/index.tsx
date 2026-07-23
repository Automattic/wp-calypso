import { useNavigate } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { earnWooPaymentsSetupRoute } from '../../../../app/router/agency';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { TextSkeleton } from '../../../../components/text-skeleton';
import { useWooPaymentsSiteSetup } from '../hooks/use-woopayments-site-setup';
import SetupSteps from './setup-steps';

export default function EarnWooPaymentsSetup() {
	const { siteId: siteIdParam } = earnWooPaymentsSetupRoute.useParams();
	const siteId = parseInt( siteIdParam, 10 );
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	const { site, siteDomain, isLoading, status, setupUrl, installAndActivate, isInstalling } =
		useWooPaymentsSiteSetup( siteId );
	const { woocommerceStatus, woocommercePaymentsStatus, isWooPaymentsActive } = status;

	const [ error, setError ] = useState( false );
	const [ isInstalled, setIsInstalled ] = useState( false );

	const onInstallClick = async () => {
		recordTracksEvent( 'calypso_a4a_woopayments_site_setup_install_plugin_click', {
			status: isInstalled ? 'installed' : 'not_installed',
			woocommerceStatus,
			woocommercePaymentsStatus,
		} );

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

	if ( ! site || isLoading ) {
		return (
			<PageLayout header={ <PageHeader title={ __( 'Site setup' ) } /> }>
				<TextSkeleton length={ 30 } />
				<TextSkeleton length={ 30 } />
			</PageLayout>
		);
	}

	return (
		<PageLayout
			header={
				<PageHeader
					title={ sprintf(
						// translators: %s is the site domain, e.g. example.com
						__( 'WooPayments is now ready to be configured on %s' ),
						siteDomain ?? site.slug
					) }
					description={ __(
						'Follow the steps below to complete the process so you can earn commissions.'
					) }
				/>
			}
		>
			<SetupSteps
				wpAdminInstallUrl={ `${ site.URL }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term` }
				isWooPaymentsActive={ isWooPaymentsActive }
				isInstalled={ isInstalled }
				isInstalling={ isInstalling }
				hasError={ error }
				onInstallClick={ onInstallClick }
				onVisitWpAdminClick={ () =>
					recordTracksEvent( 'calypso_a4a_woopayments_site_setup_install_plugin_error_click' )
				}
				onViewCommissionsClick={ () => {
					recordTracksEvent( 'calypso_a4a_woopayments_site_setup_view_commissions_click' );
					navigate( { to: '/earn/woopayments' } );
				} }
			/>
		</PageLayout>
	);
}
