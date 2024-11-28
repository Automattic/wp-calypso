import { StepContainer, NextButton } from '@automattic/onboarding';
import { useMutation } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Notice from 'calypso/components/notice';
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

const Authorization = () => {
	const translate = useTranslate();
	return (
		<>
			<div>
				<NextButton>{ translate( 'Authorize' ) }</NextButton>
			</div>
			<div>
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					type="button"
				>
					{ translate( 'Share credentials instead' ) }
				</button>
			</div>
			<div>
				<h3>{ translate( "Here's what else you're getting" ) }</h3>
				<ul>
					<li>
						{ translate( 'Uninterrupted service throughout the entire migration experience.' ) }
					</li>
					<li>
						{ translate( 'Unmatched reliability with 99.999% uptime and unmetered traffic.' ) }
					</li>
					<li>{ translate( 'Round-the-clock security monitoring and DDoS protection.' ) }</li>
				</ul>
			</div>
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
				showNotice={ isAuthorizationRejected }
				notice={
					<Notice status="is-warning" showDismiss={ false }>
						{ translate(
							"We can't start your migration without your authorization. Please authorize WordPress.com in your WP Admin or share your credentials."
						) }
					</Notice>
				}
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( 'Get ready for blazing fast speeds' ) }
						subHeaderAlign="center"
						subHeaderText={ translate(
							"We're ready to migrate longdomainname.com to WordPress.com. To make sure everything goes smoothly, we need you to authorize us for access in your WordPress admin."
						) }
						align="center"
					/>
				}
				stepContent={ <Authorization /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationApplicationPasswordsApproval;
