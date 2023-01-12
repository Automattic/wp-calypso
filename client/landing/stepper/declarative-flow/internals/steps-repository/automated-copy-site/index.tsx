import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import type { Step } from '../../types';

const TIME_CHECK_TRANSFER_STATUS = 3000;

function useCopyingStatus() {
	const [ status, setStatus ] = useState< {
		status: 'init' | 'copying' | 'success' | 'error';
		error: string | null;
	} >( {
		status: 'init',
		error: null,
	} );

	const setIsCopying = useCallback( () => setStatus( { status: 'copying', error: null } ), [] );
	const setIsSuccess = useCallback( () => setStatus( { status: 'success', error: null } ), [] );
	const setIsError = useCallback(
		( error: string ) => setStatus( { status: 'error', error } ),
		[]
	);

	return {
		isLoading: [ 'copying', 'init' ].includes( status.status ),
		isCopying: status.status === 'copying',
		isSuccess: status.status === 'success',
		isError: status.status === 'error',
		error: status.error,
		setIsCopying,
		setIsSuccess,
		setIsError,
	};
}

const AutomatedCopySite: Step = function AutomatedCopySite( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const {
		isCopying,
		isLoading,
		setIsCopying,
		setIsSuccess,
		setIsError,
		isSuccess,
		isError,
		error,
	} = useCopyingStatus();
	const site = useSite();
	const urlQueryParams = useQuery();
	const siteSlug = urlQueryParams.get( 'siteSlug' );
	const sourceSlug = urlQueryParams.get( 'sourceSlug' );
	const sourceSiteId = useSelect(
		( select ) => sourceSlug && select( SITE_STORE ).getSiteIdBySlug( sourceSlug )
	);
	const { requestLatestAtomicTransfer } = useDispatch( SITE_STORE );
	const { getSiteLatestAtomicTransfer, getSiteLatestAtomicTransferError } = useSelect( ( select ) =>
		select( SITE_STORE )
	);

	useEffect( () => {
		if ( isCopying && site ) {
			const timer = setInterval( async () => {
				await requestLatestAtomicTransfer( site.ID );
				const transfer = getSiteLatestAtomicTransfer( site.ID );
				const transferError = getSiteLatestAtomicTransferError( site.ID );
				const transferStatus = transfer?.status;
				const isTransferringStatusFailed = transferError && transferError?.status >= 500;

				if ( isTransferringStatusFailed ) {
					setIsError( 'Error Copying' );
				} else if ( transferStatus === 'completed' ) {
					setIsSuccess();
				}
			}, TIME_CHECK_TRANSFER_STATUS );
			return () => clearTimeout( timer );
		}
	}, [
		getSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError,
		isCopying,
		requestLatestAtomicTransfer,
		setIsError,
		setIsSuccess,
		site,
	] );

	const startCopying = useCallback(
		function startCopying() {
			if ( ! site?.ID || ! sourceSiteId ) {
				return;
			}
			return wpcom.req
				.post( {
					path: `/sites/${ site.ID }/copy-from-site`,
					apiNamespace: 'wpcom/v2',
					body: {
						source_blog_id: sourceSiteId,
					},
				} )
				.then( () => {
					setIsCopying();
				} )
				.catch( ( e: { message: string; code: string; data: { status: number } } ) => {
					// eslint-disable-next-line no-console
					console.error( e );
					setIsError( e.message || 'Error Starting the Copy' );
				} );
		},
		[ setIsCopying, setIsError, site?.ID, sourceSiteId ]
	);

	useEffect( () => {
		startCopying();
	}, [ startCopying ] );

	if ( ! sourceSlug || ! siteSlug ) {
		// TODO: show a better error or redirect to the start /sites
		return <h1>{ __( 'Missing required parameters' ) }</h1>;
	}

	if ( ! sourceSiteId || ! site ) {
		// eslint-disable-next-line no-console
		console.info( { sourceSlug, siteSlug, sourceSiteId, site } );
		// Wait for stores to populate
		return null;
	}

	return (
		<StepContainer
			stepName="AutomatedcopySite"
			hideBack
			recordTracksEvent={ recordTracksEvent }
			stepContent={
				<div>
					{ isLoading && <h1>{ __( 'Copying Site…' ) }</h1> }
					{ isError && (
						<>
							<h1>{ __( 'Error copying site. Contact support' ) }</h1>
							<p>{ error }</p>
							<button onClick={ startCopying }>{ __( 'Retry?' ) }</button>
						</>
					) }
					{ isSuccess && (
						<>
							<h1>{ __( 'Site copied successfully 🥳' ) }</h1>
							<p>
								{ __(
									'Congrats all your content has been migrated and your new site is ready to enjoy.'
								) }
							</p>
							<button onClick={ () => submit?.( { siteSlug } ) }>
								{ __( 'Visit my new site' ) }
							</button>
						</>
					) }
				</div>
			}
		></StepContainer>
	);
};

export default AutomatedCopySite;
