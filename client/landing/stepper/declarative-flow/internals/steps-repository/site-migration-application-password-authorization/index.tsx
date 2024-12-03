import { StepContainer, NextButton } from '@automattic/onboarding';
import { check, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Notice from 'calypso/components/notice';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useStoreApplicationPassword from './hooks/use-store-application-password';
import type { Step } from '../../types';
import './style.scss';

const AuthorizationBenefits = ( { benefits }: { benefits: string[] } ) => {
	return (
		<div className="site-migration-application-password-authorization__benefits">
			{ benefits.map( ( benefit, index ) => (
				<div className="site-migration-application-password-authorization__benefits-item" key={ index }>
					<div className="site-migration-application-password-authorization__benefits-item-icon">
						<Icon icon={ check } size={ 20 } />
					</div>
					<span>{ benefit }</span>
				</div>
			) ) }
		</div>
	);
};

interface AuthorizationProps {
	onShareCredentialsClick: () => void;
	onAuthorizationClick: () => void;
}

const Authorization = ( { onShareCredentialsClick, onAuthorizationClick }: AuthorizationProps ) => {
	const translate = useTranslate();
	return (
		<div className="site-migration-application-password-authorization__authorization">
			<div>
				<NextButton onClick={ onAuthorizationClick }>{ translate( 'Authorize' ) }</NextButton>
			</div>
			<div>
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless"
					type="button"
					onClick={ onShareCredentialsClick }
				>
					{ translate( 'Share credentials instead' ) }
				</button>
			</div>
			<div className="site-migration-application-password-authorization__benefits-container">
				<h3>{ translate( "Here's what else you're getting" ) }</h3>
				<AuthorizationBenefits
					benefits={ [
						translate( 'Uninterrupted service throughout the entire migration experience.' ),
						translate( 'Unmatched reliability with 99.999% uptime and unmetered traffic.' ),
						translate( 'Round-the-clock security monitoring and DDoS protection.' ),
					] }
				/>
			</div>
		</div>
	);
};

const SiteMigrationApplicationPasswordsAuthorization: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam();

	const source = useQuery().get( 'site_url' ) ?? '';
	const authorizationUrl = useQuery().get( 'authorization_url' ) ?? undefined;
	const isAuthorizationRejected = useQuery().get( 'success' ) === 'false';
	const applicationPassword = useQuery().get( 'password' );
	const username = useQuery().get( 'user_login' );
	const isAuthorizationSuccessful = !! ( applicationPassword && username );
	const {
		mutate: storeApplicationPasswordMutation,
		isSuccess: isStoreApplicationPasswordSuccess,
		isError: isStoreApplicationPasswordError,
		isPending: isStoreApplicationPasswordPending,
	} = useStoreApplicationPassword( siteSlug as string );
	const hasStoreApplicationPasswordResponse = isStoreApplicationPasswordSuccess || isStoreApplicationPasswordError;
	const isLoading = isAuthorizationSuccessful && ( ! hasStoreApplicationPasswordResponse || isStoreApplicationPasswordPending );

	useEffect( () => {
		if ( ! isAuthorizationSuccessful || ! siteSlug ) {
			return;
		}

		storeApplicationPasswordMutation( {
			password: applicationPassword,
			username,
			source,
		} );
	}, [ isAuthorizationSuccessful, siteSlug, useStoreApplicationPassword ] );

	useEffect( () => {
		if ( isStoreApplicationPasswordSuccess ) {
			navigation?.submit?.( { action: 'migration-started' } );
		}
	}, [ isStoreApplicationPasswordSuccess, navigation ] );

	const navigateToFallbackCredentials = () => {
		navigation?.submit?.( { action: 'fallback-credentials' } );
	};

	const startAuthorization = () => {
		navigation?.submit?.( { action: 'authorization', authorizationUrl } );
	};

	if ( isLoading ) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<DocumentHead title={ translate( 'Get ready for blazing fast speeds' ) } />
			<StepContainer
				stepName="site-migration-application-password-authorization"
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
				stepContent={
					<Authorization
						onAuthorizationClick={ startAuthorization }
						onShareCredentialsClick={ navigateToFallbackCredentials }
					/>
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationApplicationPasswordsAuthorization;
