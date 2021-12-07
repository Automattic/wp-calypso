/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { Icon, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
/**
 * Internal dependencies
 */
import { login } from 'calypso/lib/paths';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import './style.scss';

function getLoginLink( { flowName, locale } ) {
	const redirectToUrl = window.location.origin + getStepUrl( flowName, 'p2-site' );

	return login( {
		redirectTo: redirectToUrl,
		locale,
		signupUrl: `/start/${ flowName }/`,
		from: 'p2',
	} );
}

function P2GetStarted( {
	flowName,
	stepName,
	positionInFlow,
	locale,
	submitSignupStep,
	goToNextStep,
} ) {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );

	const handleNextStepClick = ( option ) => {
		submitSignupStep( {
			stepName,
			option,
		} );

		goToNextStep();
	};

	const renderOption = ( slug, title, description ) => {
		return (
			<div className="p2-get-started__option">
				<Button
					className="p2-get-started__option-button"
					onClick={ () => {
						handleNextStepClick( slug );
					} }
				>
					<div className="p2-get-started__option-title">{ title }</div>
					<div className="p2-get-started__option-description">{ description }</div>
					<div className="p2-get-started__option-icon">
						<Icon icon={ chevronRight } />
					</div>
				</Button>
			</div>
		);
	};

	const renderLoginLink = () => {
		return (
			<div className="p2-get-started__log-in">
				{ translate( 'Already have a WordPress.com account? {{a}}Log in.{{/a}}', {
					components: {
						a: <a href={ getLoginLink( { flowName, locale } ) } />,
					},
				} ) }
			</div>
		);
	};

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Get started with P2' ) }
		>
			<div className="p2-get-started">
				<div className="p2-get-started__options">
					{ renderOption(
						'create',
						translate( 'Create a new workspace' ),
						translate( "Start a new P2 and get your team on the same page — it's free!" )
					) }

					{ renderOption(
						'join',
						translate( 'Join an existing workspace' ),
						translate( 'Is your team already using P2? Sign up to join them.' )
					) }

					{ ! isLoggedIn && renderLoginLink() }
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2GetStarted;
