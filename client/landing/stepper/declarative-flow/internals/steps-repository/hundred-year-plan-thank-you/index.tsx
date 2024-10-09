import { UserSelect } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import EarthImg from 'calypso/assets/images/hundred-year-plan-onboarding/earth-stars-flare.jpg';
import FormattedHeader from 'calypso/components/formatted-header';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';

import './styles.scss';

const HundredYearPlanThankYou: Step = function HundredYearPlanThankYou( { flow } ) {
	const translate = useTranslate();
	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	return (
		<HundredYearPlanStepWrapper
			stepContent={
				<Button
					variant="secondary"
					href={ localizeUrl( 'https://wordpress.com/support/plan-features/100-year-plan/' ) }
				>
					{ translate( 'View guide' ) }
				</Button>
			}
			formattedHeader={
				<>
					<img src={ EarthImg } alt="Earth" />
					<FormattedHeader
						brandFont
						headerText={ translate( 'Your next century awaits' ) }
						subHeaderText={ translate(
							"You are all set! We've sent a calendar invite to {{strong}}%(email)s{{/strong}}. To warm up for our discussion, we recommend reading our guide on the {{em}}100-Year Plan{{/em}}.",
							{
								args: { email: currentUser?.email || 'email' },
								components: {
									strong: <strong />,
									em: <em />,
								},
							}
						) }
						subHeaderAlign="center"
					/>
				</>
			}
			stepName="hundred-year-plan-setup hundred-year-plan-setup__thank-you"
			flowName={ flow }
			justifyStepContent="center"
			hideInfoColumn
		/>
	);
};

export default HundredYearPlanThankYou;
