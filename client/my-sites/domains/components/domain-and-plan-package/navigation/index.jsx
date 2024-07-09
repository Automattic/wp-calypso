import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function DomainAndPlanPackageNavigation( props ) {
	const translate = useTranslate();

	// `goBackLink` will be either wp-admin or My Home, depending on the user's
	// current admin interface preference.
	// If unavailable, we fall back to the previous page in history.
	const goBack = () => {
		if ( props.goBackLink ) {
			window.location.assign( props.goBackLink );
		}
	};

	const step = props.step ? props.step : 1;

	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: step, stepCount: 3 },
	} );

	const buttonText =
		props.goBackText || ( props.step !== 1 ? translate( 'Back' ) : translate( 'Home' ) );

	return (
		<div className="domain-and-plan-package-navigation">
			<div className="domain-and-plan-package-navigation__back">
				<Button borderless="true" onClick={ goBack }>
					<Gridicon icon="chevron-left" />
					<span>{ buttonText }</span>
				</Button>
			</div>
			<ol className="domain-and-plan-package-navigation__steps">
				<li className={ step === 1 ? 'domain-and-plan-package-navigation__active' : '' }>
					{ step === 2 && <Gridicon icon="checkmark" /> }
					{ translate( 'Select a domain' ) }
					<Gridicon icon="chevron-right" />
				</li>
				{ ! props.hidePlansPage && (
					<li className={ step === 2 ? 'domain-and-plan-package-navigation__active' : '' }>
						{ translate( 'Select a plan' ) }
						<Gridicon icon="chevron-right" />
					</li>
				) }
				<li>{ translate( 'Complete your purchase' ) }</li>
			</ol>
			<div className="domain-and-plan-package-navigation__step-indication">{ stepIndication }</div>
		</div>
	);
}
