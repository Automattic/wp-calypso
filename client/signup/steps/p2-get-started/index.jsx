import { Button } from '@wordpress/components';
import { Icon, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { login } from 'calypso/lib/paths';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';

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

function P2GetStarted( { flowName, stepName, positionInFlow, locale } ) {
	const translate = useTranslate();

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Get started with P2' ) }
		>
			<div className="p2-get-started">
				<div className="p2-get-started__options">
					<div className="p2-get-started__option">
						<div className="p2-get-started__option-title">
							{ translate( 'Create a new workspace' ) }
						</div>
						<div className="p2-get-started__option-description">
							{ translate( "Start a new P2 and get your team on the same page — it's free!" ) }
						</div>
						<Button className="p2-get-started__button-next">
							<Icon className="p2-get-started__button-next-icon" icon={ chevronRight } />
						</Button>
					</div>
					<div className="p2-get-started__option">
						<div className="p2-get-started__option-title">
							{ translate( 'Join an existing workspace' ) }
						</div>
						<div className="p2-get-started__option-description">
							{ translate( 'Is your team already using P2? Sign up to join them.' ) }
						</div>
						<Button className="p2-get-started__button-next">
							<Icon className="p2-get-started__button-next-icon" icon={ chevronRight } />
						</Button>
					</div>
					<div className="p2-get-started__log-in">
						{ translate( 'Already have a WordPress.com account? {{a}}Log in.{{/a}}', {
							components: {
								a: <a href={ getLoginLink( { flowName, locale } ) } />,
							},
						} ) }
					</div>
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2GetStarted;
