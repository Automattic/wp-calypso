import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { login } from 'calypso/lib/paths';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import './style.scss';

function getRedirectToAfterLoginUrl( { flowName } ) {
	return window.location.origin + getStepUrl( flowName, 'p2-site' );
}

function getLoginLink( { flowName, locale } ) {
	return login( {
		redirectTo: getRedirectToAfterLoginUrl( { flowName } ),
		locale,
		signupUrl: '/start/p2/user',
		from: 'p2',
	} );
}

function P2Details( {
	flowName,
	stepName,
	positionInFlow,
	goToNextStep,
	submitSignupStep,
	goToStep,
	locale,
	progress: {
		'p2-site': { siteTitle, site },
	},
} ) {
	const translate = useTranslate();

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( "We're almost finished! Your P2 workspace will be:" ) }
		>
			<div className="p2-details">
				<div className="p2-details__site-part">
					<h3 className="p2-details__site-title">{ siteTitle }</h3>
					<div className="p2-details__blog-name">{ `${ site }.wordpress.com` }</div>
					<a
						href="/nowhere"
						className="p2-details__change-details-link"
						onClick={ ( e ) => {
							e.preventDefault();
							goToStep( 'p2-site' );
						} }
					>
						{ translate( 'Change details' ) }
					</a>
				</div>
				<div className="p2-details__description">
					{ translate(
						'P2 is powered by WordPress.com: log in to your account (or create a new one) ' +
							'to continue.'
					) }
				</div>
				<div className="p2-details__actions">
					<Button
						primary
						className="p2-details__login-btn"
						onClick={ () => {
							submitSignupStep( {
								stepName: stepName,
							} );

							recordTracksEvent( 'calypso_signup_p2_details_login_button_click' );

							page( getLoginLink( { flowName, locale } ) );
						} }
					>
						{ translate( 'Log in to WordPress.com' ) }
					</Button>
					<Button
						onClick={ () => {
							submitSignupStep( {
								stepName: stepName,
							} );

							recordTracksEvent( 'calypso_signup_p2_details_signup_button_click' );

							goToNextStep();
						} }
					>
						{ translate( 'Sign up to WordPress.com' ) }
					</Button>
				</div>
			</div>
		</P2StepWrapper>
	);
}

P2Details.propTypes = {
	flowName: PropTypes.string.isRequired,
	stepName: PropTypes.string.isRequired,
	positionInFlow: PropTypes.number.isRequired,
};

export default P2Details;
