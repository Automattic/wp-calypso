import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../../../app/analytics';
import { earnWooPaymentsSetupRoute } from '../../../../app/router/agency';
import { PageHeader } from '../../../../components/page-header';
import PageLayout from '../../../../components/page-layout';
import { SectionHeader } from '../../../../components/section-header';
import { TextSkeleton } from '../../../../components/text-skeleton';
import { useWooPaymentsSiteSetup } from '../hooks/use-woopayments-site-setup';

export default function EarnWooPaymentsSetup() {
	const { siteId: siteIdParam } = earnWooPaymentsSetupRoute.useParams();
	const siteId = parseInt( siteIdParam, 10 );
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	const { site, isLoading, status, setupUrl, installAndActivate, isInstalling } =
		useWooPaymentsSiteSetup( siteId );
	const { woocommerceStatus, woocommercePaymentsStatus, isWooPaymentsActive } = status;

	const [ error, setError ] = useState( false );
	const [ isInstalled, setIsInstalled ] = useState( false );

	useEffect( () => {
		// Send the agency back to the dashboard if the route param isn't a real site id.
		if ( Number.isNaN( siteId ) ) {
			navigate( { to: '/earn/woopayments' } );
		}
	}, [ siteId, navigate ] );

	const onInstallPluginClick = async () => {
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
						site.slug
					) }
					description={ __(
						'Follow the steps below to complete the process so you can earn commissions.'
					) }
				/>
			}
		>
			<VStack spacing={ 8 }>
				<VStack spacing={ 4 } alignment="flex-start">
					<SectionHeader
						level={ 3 }
						title={ __( 'Install and activate the plugin on WP-Admin' ) }
						description={ __(
							"Click the button and we'll automatically install and activate the plugin for you. Then we'll launch WP-Admin so you can configure the final steps."
						) }
					/>
					{ error ? (
						<VStack spacing={ 4 } alignment="flex-start">
							<Text isBlock>
								{ __(
									"We're sorry, we weren't able to install WooPayments on your site. Visit your WP-Admin to set up."
								) }
							</Text>
							<Button
								variant="primary"
								href={ `${ site.URL }/wp-admin/plugin-install.php?s=woopayments&tab=search&type=term` }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ () =>
									recordTracksEvent(
										'calypso_a4a_woopayments_site_setup_install_plugin_error_click'
									)
								}
							>
								{ __( 'Visit WP-Admin ↗' ) }
							</Button>
						</VStack>
					) : (
						<Button
							disabled={ isInstalling }
							isBusy={ isInstalling }
							variant="primary"
							onClick={ onInstallPluginClick }
						>
							{ isInstalled || isWooPaymentsActive
								? __( 'Finish setup ↗' )
								: __( 'Install and activate the plugin ↗' ) }
						</Button>
					) }
				</VStack>

				<VStack spacing={ 4 } alignment="flex-start">
					<SectionHeader
						level={ 3 }
						title={ __( 'Earn commissions' ) }
						description={ __(
							"Once the plugin is installed and configured, each time a transaction occurs, you'll earn commisions!"
						) }
					/>
					<Button
						variant="secondary"
						onClick={ () => {
							recordTracksEvent( 'calypso_a4a_woopayments_site_setup_view_commissions_click' );
							navigate( { to: '/earn/woopayments' } );
						} }
					>
						{ __( 'View WooPayments commissions' ) }
					</Button>
				</VStack>
			</VStack>
		</PageLayout>
	);
}
