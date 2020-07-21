/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import P2StepWrapper from 'signup/p2-step-wrapper';
import { Button } from '@automattic/components';
import { login } from 'lib/paths';
import { getStepUrl } from 'signup/utils';

/**
 * Style dependencies
 */
import './style.scss';

function getOriginUrl() {
	return (
		window.location.protocol +
		'//' +
		window.location.hostname +
		( window.location.port ? ':' + window.location.port : '' )
	);
}

function getRedirectToAfterLoginUrl( { flowName } ) {
	return getOriginUrl() + getStepUrl( flowName, 'p2-site' );
}

function getLoginLink( { flowName, locale } ) {
	return login( {
		redirectTo: getRedirectToAfterLoginUrl( { flowName } ),
		isNative: true,
		locale: locale,
	} );
}

function P2LoginSignup( {
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
			headerText={ translate( "We're almost finished! Your P2 will be:" ) }
		>
			<div className="p2-login-signup">
				<div className="p2-login-signup__site-part">
					<h3 className="p2-login-signup__site-title">{ siteTitle }</h3>
					<div className="p2-login-signup__blog-name">{ `${ site }.p2.blog` }</div>
					<a
						href="/nowhere"
						className="p2-login-signup__change-details-link"
						onClick={ ( e ) => {
							e.preventDefault();
							goToStep( 'p2-site' );
						} }
					>
						{ translate( 'Change details' ) }
					</a>
				</div>
				<div className="p2-login-signup__description">
					{ translate(
						'P2 is powered by WordPress.com: log in with your account (or create a new one) ' +
							'to continue.'
					) }
				</div>
				<div className="p2-login-signup__actions">
					<Button
						primary
						className="p2-login-signup__login-btn"
						onClick={ () => {
							submitSignupStep( {
								stepName: stepName,
							} );

							page( getLoginLink( { flowName, locale } ) );
						} }
					>
						Log in with WordPress.com
					</Button>
					<Button
						onClick={ () => {
							submitSignupStep( {
								stepName: stepName,
							} );

							goToNextStep();
						} }
					>
						Sign up to WordPress.com
					</Button>
				</div>
			</div>
		</P2StepWrapper>
	);
}

P2LoginSignup.propTypes = {
	flowName: PropTypes.string.isRequired,
	stepName: PropTypes.string.isRequired,
	positionInFlow: PropTypes.number.isRequired,
};

export default P2LoginSignup;
