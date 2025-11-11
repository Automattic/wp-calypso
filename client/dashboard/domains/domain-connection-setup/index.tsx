import {
	DomainMappingStatus,
	type DomainConnectionSetupModeValue,
	DomainConnectionSetupMode,
} from '@automattic/api-core';
import {
	domainConnectionSetupInfoQuery,
	domainMappingStatusQuery,
	domainQuery,
	updateConnectionModeMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { domainRoute, domainConnectionSetupRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainConnectionSetup from './domain-connection-setup';
import DomainConnectionVerification from './domain-connection-verification';

import './style.scss';

export default function DomainConnection() {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const { domainName } = domainRoute.useParams();
	const {
		error: queryError,
		error_description: queryErrorDescription,
		step,
	} = domainConnectionSetupRoute.useSearch();
	// Load domain data
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const siteSlug = domain.site_slug;

	// Load domain connection setup info
	const router = useRouter();
	const relativePath = router.buildLocation( {
		to: domainConnectionSetupRoute.fullPath,
		params: { domainName },
	} ).href;
	// Add domain_connect parameter to return URL so we know when user comes back from DC
	const returnUrl = new URL( relativePath, window.location.origin ).href + '?step=dc_return';
	const { data: domainConnectionSetupInfo } = useSuspenseQuery(
		domainConnectionSetupInfoQuery( domainName, domain.blog_id, returnUrl )
	);
	const { data: domainMappingStatus } = useSuspenseQuery( domainMappingStatusQuery( domainName ) );

	const [ connectionMode, setConnectionMode ] = useState< DomainConnectionSetupModeValue | null >(
		domainMappingStatus.mode
	);

	// Update connection mode mutation
	const { mutate: updateConnectionMode, isPending: isUpdatingConnectionMode } = useMutation(
		updateConnectionModeMutation( domainName, domain.blog_id )
	);

	// Sync local state with server state when it changes (e.g., on page reload)
	useEffect( () => {
		setConnectionMode( domainMappingStatus.mode );
	}, [ domainMappingStatus.mode ] );

	const onVerifyConnection = ( mode: DomainConnectionSetupModeValue ) => {
		// For Domain Connect, just redirect - don't update server yet
		if (
			mode === DomainConnectionSetupMode.DC &&
			domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting
		) {
			window.location.href = domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting;
			return;
		}

		// For manual modes (SUGGESTED/ADVANCED), update the server
		updateConnectionMode( mode, {
			onSuccess: ( data: DomainMappingStatus ) => {
				recordTracksEvent( 'calypso_dashboard_domain_connection_setup', {
					domain: domainName,
					mode,
					query_error: queryError,
					query_error_description: queryErrorDescription,
					supports_our_domain_connect_template:
						!! domainConnectionSetupInfo.domain_connect_apply_wpcom_hosting,
					domain_connect_provider_id: domainConnectionSetupInfo.domain_connect_provider_id,
				} );

				// Clear error query params from URL after successful mutation
				if ( queryError || queryErrorDescription ) {
					router.navigate( {
						to: domainConnectionSetupRoute.fullPath,
						params: { domainName },
						search: {},
						replace: true,
					} );
				}

				// Set connection mode to show verification step
				setConnectionMode( data.mode );
			},
			onError: () => {
				createErrorNotice( __( 'We could not verify your domain connection. Please try again.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	// If returning from successful Domain Connect, update the server
	useEffect( () => {
		if ( step === 'dc_return' && ! queryError && ! isUpdatingConnectionMode ) {
			// Call mutation to set mode to DC
			updateConnectionMode( DomainConnectionSetupMode.DC, {
				onSuccess: ( data: DomainMappingStatus ) => {
					recordTracksEvent( 'calypso_dashboard_domain_connection_setup', {
						domain: domainName,
						mode: DomainConnectionSetupMode.DC,
						query_error: null,
						query_error_description: null,
						supports_our_domain_connect_template: true,
						domain_connect_provider_id: domainConnectionSetupInfo.domain_connect_provider_id,
					} );

					// Clear the domain_connect param from URL
					router.navigate( {
						to: domainConnectionSetupRoute.fullPath,
						params: { domainName },
						search: {},
						replace: true,
					} );

					setConnectionMode( data.mode );
				},
			} );
		}
	}, [
		step,
		queryError,
		isUpdatingConnectionMode,
		updateConnectionMode,
		recordTracksEvent,
		domainName,
		domainConnectionSetupInfo.domain_connect_provider_id,
		router,
	] );

	// If the connection mode is not null, it means we are on the verification step
	const isVerificationStep = !! connectionMode;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={
						isVerificationStep
							? __( 'Domain connection verification' )
							: __( 'Connect your domain name' )
					}
					description={
						isVerificationStep
							? null
							: __( 'We’ll tailor the next steps based on how your domain name is currently used.' )
					}
				/>
			}
		>
			{ isVerificationStep && ! queryError ? (
				<DomainConnectionVerification
					domainData={ domain }
					domainName={ domainName }
					siteSlug={ siteSlug }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					domainMappingStatus={ domainMappingStatus }
				/>
			) : (
				<DomainConnectionSetup
					domainName={ domainName }
					siteSlug={ siteSlug }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					domainMappingStatus={ domainMappingStatus }
					onVerifyConnection={ onVerifyConnection }
					isUpdatingConnectionMode={ isUpdatingConnectionMode }
					queryError={ queryError }
					queryErrorDescription={ queryErrorDescription }
				/>
			) }
		</PageLayout>
	);
}
