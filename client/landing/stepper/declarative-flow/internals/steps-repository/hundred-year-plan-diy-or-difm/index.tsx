import config from '@automattic/calypso-config';
import { UserSelect } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, check } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import CalendlyWidget from '../components/calendy-widget';
import HundredYearPlanStepWrapper from '../hundred-year-plan-step-wrapper';
import type { Step } from '../../types';

import './styles.scss';

const HundredYearPlanDIYOrDIFM: Step = function HundredYearPlanDIYOrDIFM( { navigation, flow } ) {
	const translate = useTranslate();
	const { submit } = navigation;

	const [ showModal, setShowModal ] = useState( false );

	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);

	const onCalendlyViewed = useCallback( () => {
		const closeButtonEl = document.querySelector( '.calendly-popup-close' );

		const handleCloseClick = () => {
			setShowModal( false );
			closeButtonEl?.removeEventListener( 'click', handleCloseClick );
		};

		closeButtonEl?.addEventListener( 'click', handleCloseClick );
	}, [ showModal ] );

	const onSchedule = useCallback( () => {
		// Show the event details for a second before moving to the next step
		setTimeout( () => {
			setShowModal( false );
			submit?.( { nextStep: 'thank-you' } );
		}, 1000 );
	}, [ setShowModal, submit ] );

	return (
		<>
			{ showModal && (
				<CalendlyWidget
					url={ config( '100_year_plan_calendly_id' ) }
					prefill={
						currentUser ? { name: currentUser?.display_name, email: currentUser?.email } : undefined
					}
					hideGdprBanner
					onSchedule={ () => onSchedule() }
					onCalendlyViewed={ () => onCalendlyViewed() }
				/>
			) }
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
								<Button
									variant="primary"
									onClick={ () => {
										setShowModal( true );
									} }
								>
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
						subHeaderText={ translate( "Join us for an exclusive strategy session where we'll" ) }
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
