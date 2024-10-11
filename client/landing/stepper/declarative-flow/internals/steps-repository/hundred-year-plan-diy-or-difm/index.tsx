import config from '@automattic/calypso-config';
import { UserSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { useCalendlyWidget } from '../components/calendly-widget/use-calendly-widget';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';

import './styles.scss';

const HundredYearPlanDIYOrDIFM: Step = function HundredYearPlanDIYOrDIFM( { navigation, flow } ) {
	const translate = useTranslate();
	const { submit } = navigation;

	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	const { openCalendlyPopup, closeCalendlyPopup } = useCalendlyWidget( {
		url: config( '100_year_plan_calendly_id' ),
		prefill: currentUser
			? { name: currentUser?.display_name, email: currentUser?.email }
			: undefined,
		hideGdprBanner: true,
		onSchedule: () => {
			submit?.( { nextStep: 'thank-you' } );
			// Close the Calendly popup after 1 second, to improve the user experience
			setTimeout( closeCalendlyPopup, 1000 );
		},
	} );

	return (
		<>
			<HundredYearPlanStepWrapper
				stepContent={
					<>
						<div>
							<ul>
								<li>
									<Icon size={ 18 } icon={ check } />{ ' ' }
									{ translate( 'Conduct a comprehensive digital longevity assessment' ) }
								</li>
								<li>
									<Icon size={ 18 } icon={ check } />{ ' ' }
									{ translate( 'Showcase our comprehensive legacy-building tools' ) }
								</li>
								<li>
									<Icon size={ 18 } icon={ check } />{ ' ' }
									{ translate( 'Answer all your questions about long-term success' ) }
								</li>
								<li>
									<Icon size={ 18 } icon={ check } />{ ' ' }
									{ translate( 'Chart a course for the production of your new site' ) }
								</li>
							</ul>

							<div className="buttons-container">
								<Button variant="primary" onClick={ () => openCalendlyPopup() }>
									{ translate( 'Schedule your free call' ) }
								</Button>

								<Button variant="link" onClick={ () => submit?.( { diyOrDifmChoice: 'diy' } ) }>
									{ translate( "I'll create my site on my own" ) }
								</Button>
							</div>
						</div>
					</>
				}
				formattedHeader={
					<FormattedHeader
						brandFont
						headerText={ translate( "Let's craft your next century" ) }
						subHeaderText={ translate( "Join us for an exclusive strategy session where we'll:" ) }
						subHeaderAlign="center"
					/>
				}
				stepName="hundred-year-plan-setup hundred-year-plan-setup__diy-or-difm"
				flowName={ flow }
				justifyStepContent="center"
			/>
		</>
	);
};

export default HundredYearPlanDIYOrDIFM;
