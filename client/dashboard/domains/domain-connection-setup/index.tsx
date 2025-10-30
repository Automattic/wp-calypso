import { DomainMappingStatus, type DomainConnectionSetupModeValue } from '@automattic/api-core';
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
import { useState } from 'react';
import { domainRoute, domainConnectionSetupRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainConnectionSetup from './domain-connection-setup';
import DomainConnectionVerification from './domain-connection-verification';

import './style.scss';

export default function DomainConnection() {
	const { createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const { error: queryError, error_description: queryErrorDescription } = domainRoute.useSearch();

	// Load domain data
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const siteSlug = domain.site_slug;

	// Load domain connection setup info
	const router = useRouter();
	const relativePath = router.buildLocation( {
		to: domainConnectionSetupRoute.fullPath,
		params: { domainName },
	} ).href;
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

	const onVerifyConnection = ( mode: DomainConnectionSetupModeValue ) => {
		updateConnectionMode( mode, {
			onSuccess: ( data: DomainMappingStatus ) => {
				setConnectionMode( data.mode );
			},
			onError: () => {
				createErrorNotice(
					__( 'We couldn’t verify the connection for your domain, please try again.' ),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

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
							: __( 'Domain connection setup' )
					}
				/>
			}
		>
			{ isVerificationStep ? (
				<DomainConnectionVerification
					domainName={ domainName }
					siteSlug={ siteSlug }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					domainMappingStatus={ domainMappingStatus }
					queryError={ queryError }
					queryErrorDescription={ queryErrorDescription }
				/>
			) : (
				<DomainConnectionSetup
					domainName={ domainName }
					siteSlug={ siteSlug }
					domainConnectionSetupInfo={ domainConnectionSetupInfo }
					onVerifyConnection={ onVerifyConnection }
					isUpdatingConnectionMode={ isUpdatingConnectionMode }
				/>
			) }
		</PageLayout>
	);
}
