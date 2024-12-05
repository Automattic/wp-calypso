import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import Notice from 'calypso/components/notice';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Authorization from './components/authorization';
import useStoreApplicationPassword from './hooks/use-store-application-password';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationApplicationPasswordsAuthorization: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const siteSlug = useSiteSlugParam();

	const source = useQuery().get( 'from' ) ?? '';
	const authorizationUrl = useQuery().get( 'authorizationUrl' ) ?? undefined;
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
	const hasStoreApplicationPasswordResponse =
		isStoreApplicationPasswordSuccess || isStoreApplicationPasswordError;
	const isLoading =
		isAuthorizationSuccessful &&
		( ! hasStoreApplicationPasswordResponse || isStoreApplicationPasswordPending );

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
		navigation?.submit?.( { action: 'fallback-credentials', authorizationUrl } );
	};

	const startAuthorization = () => {
		navigation?.submit?.( { action: 'authorization', authorizationUrl } );
	};

	const contactMe = () => {
		navigation?.submit?.( { action: 'contact-me' } );
	};

	let notice = undefined;
	if ( isStoreApplicationPasswordError ) {
		notice = (
			<Notice status="is-error" showDismiss={ false }>
				{ translate( "We couldn't complete the authorization." ) }
				<button
					className="button navigation-link step-container__navigation-link has-underline is-borderless site-migration-application-password-authorization__contact-me-button"
					type="button"
					onClick={ contactMe }
				>
					{ translate( 'Please contact me.' ) }
				</button>
			</Notice>
		);
	} else if ( isAuthorizationRejected ) {
		notice = (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					"We can't start your migration without your authorization. Please authorize WordPress.com in your WP Admin or share your credentials."
				) }
			</Notice>
		);
	}

	const sourceDomain = new URL( source ).host;

	// translators: %(sourceDomain)s is the source domain that is being migrated.
	const subHeaderText = translate(
		"We're ready to migrate {{strong}}%(sourceDomain)s{{/strong}} to WordPress.com. To make sure everything goes smoothly, we need you to authorize us for access in your WordPress admin.",
		{
			args: {
				sourceDomain,
			},
			components: {
				strong: <strong />,
			},
		}
	);

	const formattedHeader = ! isLoading ? (
		<FormattedHeader
			id="site-migration-credentials-header"
			headerText={ translate( 'Get ready for blazing fast speeds' ) }
			subHeaderAlign="center"
			subHeaderText={ subHeaderText }
			align="center"
		/>
	) : undefined;

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
				notice={ notice }
				formattedHeader={ formattedHeader }
				stepContent={
					! isLoading ? (
						<Authorization
							onAuthorizationClick={ startAuthorization }
							onShareCredentialsClick={ navigateToFallbackCredentials }
						/>
					) : (
						<div data-testid="loading-ellipsis">
							<LoadingEllipsis />
						</div>
					)
				}
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationApplicationPasswordsAuthorization;
