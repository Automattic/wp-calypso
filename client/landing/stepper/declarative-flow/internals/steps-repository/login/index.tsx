/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useAnchorFmParams } from 'calypso/landing/stepper/hooks/use-anchor-fm-params';
import useDetectMatchingAnchorSite from 'calypso/landing/stepper/hooks/use-detect-matching-anchor-site';
import { ONBOARD_STORE, USER_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import '../style.scss';
const LoginStep: Step = function LoginStep( { navigation } ) {
	const { submit, goNext, goToStep } = navigation;
	const { __ } = useI18n();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
	//Check to see if there is a site with a matching anchor podcast ID
	const isLookingUpMatchingAnchorSites = useDetectMatchingAnchorSite();
	const { setSiteSetupError } = useDispatch( SITE_STORE );
	const { setAnchorPodcastId, setAnchorEpisodeId, setAnchorSpotifyUrl } =
		useDispatch( ONBOARD_STORE );
	const { anchorFmPodcastId, isAnchorFmPodcastIdError, anchorFmEpisodeId, anchorFmSpotifyUrl } =
		useAnchorFmParams();

	const LoginForm: React.FC = () => {
		const handleSubmit = () => {
			const providedDependencies = {
				anchorFmPodcastId,
				anchorFmEpisodeId,
				anchorFmSpotifyUrl,
			};
			setAnchorPodcastId( ! isAnchorFmPodcastIdError ? anchorFmPodcastId : null );
			setAnchorEpisodeId( anchorFmEpisodeId );
			setAnchorSpotifyUrl( anchorFmSpotifyUrl );
			submit?.( providedDependencies );
		};

		return (
			<form
				className="login__form"
				onSubmit={ () => {
					handleSubmit?.();
				} }
			>
				<Button className="login__submit-button" type="submit" primary>
					{ __( 'Continue' ) }
				</Button>
			</form>
		);
	};

	/*
	 * If we have a current user and they're logged in,
	 * proceed to the next step; no need to log in.
	 */
	useEffect( () => {
		if ( currentUser && userIsLoggedIn ) {
			goNext?.();
		}
	}, [ currentUser, userIsLoggedIn ] );

	useEffect( () => {
		if ( isAnchorFmPodcastIdError ) {
			const error = __( "We're sorry!" );
			const message = __(
				"We're unable to locate your podcast. Return to Anchor or continue with site creation."
			);
			setSiteSetupError( error, message );
			return goToStep?.( 'error' );
		}
	}, [ isAnchorFmPodcastIdError ] );

	//If we're still checking for matching Anchor sites, don't show the form
	if ( isLookingUpMatchingAnchorSites ) {
		return <div />;
	}

	return (
		<StepContainer
			stepName={ 'login-step' }
			hideBack
			hideSkip
			hideNext
			stepContent={ <LoginForm /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default LoginStep;
