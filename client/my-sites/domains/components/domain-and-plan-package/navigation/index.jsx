import { Button, Gridicon } from '@automattic/components';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { WPCOM_PLANS_UI_STORE } from 'calypso/my-sites/plan-features-2023-grid/store';

import './style.scss';

export default function DomainAndPlanPackageNavigation( props ) {
	const translate = useTranslate();
	const { setShowDomainUpsellDialog } = useDispatch( WPCOM_PLANS_UI_STORE );

	const goBack = () => {
		if ( props.goBackLink ) {
			page( props.goBackLink );
		} else {
			window.history.go( -1 );
		}
	};

	const goSkipPlan = () => {
		recordTracksEvent( 'calypso_plans_page_domain_upsell_skip_click' );
		setShowDomainUpsellDialog( true );
	};

	const step = props.step ? props.step : 1;

	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: step, stepCount: 3 },
	} );

	return (
		<div className="domain-and-plan-package-navigation">
			<div className="domain-and-plan-package-navigation__back">
				<Button borderless="true" onClick={ goBack }>
					<Gridicon icon="chevron-left" />
					{ props.step !== 1 ? (
						<span>{ translate( 'Back' ) }</span>
					) : (
						<span>{ translate( 'Home' ) }</span>
					) }
				</Button>
			</div>
			<ol className="domain-and-plan-package-navigation__steps">
				<li className={ step === 1 ? 'domain-and-plan-package-navigation__active' : '' }>
					{ step === 2 && <Gridicon icon="checkmark" /> }
					{ translate( 'Select a domain' ) }
					<Gridicon icon="chevron-right" />
				</li>
				<li className={ step === 2 ? 'domain-and-plan-package-navigation__active' : '' }>
					{ translate( 'Select a plan' ) }
					<Gridicon icon="chevron-right" />
				</li>
				<li>{ translate( 'Complete your purchase' ) }</li>
			</ol>
			<div className="domain-and-plan-package-navigation__step-indication">{ stepIndication }</div>
			{ props.showSkipPlans && (
				<div className="domain-and-plan-package-navigation__skip">
					<Button borderless="true" onClick={ goSkipPlan }>
						<span>{ translate( 'Skip' ) }</span>
						<Gridicon icon="chevron-right" />
					</Button>
				</div>
			) }
		</div>
	);
}
