import { StepContainer } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ApiError } from '../site-migration-credentials/types';
import type { Step } from '../../types';

interface StoreApplicationPasswordResponse {
	success: boolean;
}

interface StoreApplicationPasswordPayload {
	password: string;
	username: string;
	source: string;
}

const useStoreApplicationPassword = ( siteSlug: string ) => {
	return useMutation< StoreApplicationPasswordResponse, ApiError, StoreApplicationPasswordPayload >(
		{
			mutationFn: ( { password, username, source } ) => {
				return wpcomRequest( {
					path: `sites/${ siteSlug }/automated-migration/application-passwords`,
					apiNamespace: 'wpcom/v2/',
					apiVersion: '2',
					method: 'POST',
					body: {
						password,
						username,
						source,
					},
				} );
			},
		}
	);
};

interface AuthorizationProps {
	isAuthorizationSuccessful: boolean;
	isAuthorizationRejected: boolean;
}

const Authorization = ( {
	isAuthorizationSuccessful,
	isAuthorizationRejected,
}: AuthorizationProps ) => {
	return (
		<>
			{ isAuthorizationSuccessful && <></> }
			{ isAuthorizationRejected && <></> }
		</>
	);
};

const SiteMigrationApplicationPasswordsApproval: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam();

	const isAuthorizationRejected = useQuery().get( 'rejected' ) === 'true';
	const applicationPassword = useQuery().get( 'password' );
	const username = useQuery().get( 'user_login' );
	const isAuthorizationSuccessful = !! ( applicationPassword && username );
	const { mutate: storeApplicationPasswordMutation } = useStoreApplicationPassword(
		siteSlug as string
	);

	useEffect( () => {
		if ( ! isAuthorizationSuccessful || ! siteSlug ) {
			return;
		}

		storeApplicationPasswordMutation( {
			password: applicationPassword,
			username,
			source: 'site-migration',
		} );
	}, [ isAuthorizationSuccessful, siteSlug, useStoreApplicationPassword ] );

	return (
		<>
			<DocumentHead title={ translate( 'Get ready for blazing fast speeds' ) } />
			<StepContainer
				stepName="site-migration-approval"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				hideSkip
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( 'Get ready for blazing fast speeds' ) }
						subHeaderText={ translate(
							'Help us get started by providing some basic details about your current website.'
						) }
						align="center"
					/>
				}
				stepContent={
					<Authorization
						isAuthorizationSuccessful={ isAuthorizationSuccessful }
						isAuthorizationRejected={ isAuthorizationRejected }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationApplicationPasswordsApproval;
