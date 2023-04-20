import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

const PaidSubscribers: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();

	const { setPaidSubscribers } = useDispatch( ONBOARD_STORE );
	const state = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] ).getState();

	useEffect( () => {
		const { paidSubscribers } = state;
		setPaidSubscribers( paidSubscribers );
	}, [ state ] );

	const paidSubscribersContinue = ( value: boolean ) => {
		setPaidSubscribers( value );
		submit?.();
	};

	return (
		<StepContainer
			stepName="paid-subscribers"
			isWideLayout={ true }
			hideBack={ true }
			flowName="newsletter"
			formattedHeader={
				<FormattedHeader
					headerText={ translate(
						// 'Are you going to share exclusive content with paid subscribers?'
						'Get paid and be supported by your subscribers'
					) }
					subHeaderText={ translate(
						// "Don't worry, ..."
						'You can turn on monetization at any point later on.'
					) }
					align="center"
				/>
			}
			stepContent={
				<>
					<div className="paid-subscribers__intro">
						{ translate(
							'You can publish your newsletter for free, and choose to let your subscribers support you with a monthly fee. Your posts can stay public, subscribers-only, or paywalled.'
						) }
					</div>

					<img
						alt=""
						className="paid-subscribers__image"
						src="https://i0.wp.com/live-patreon-marketing.pantheonsite.io/wp-content/uploads/2020/12/For-communities-03_2x-1.jpg"
					/>

					<div className="paid-subscribers__cta">
						<Button onClick={ () => paidSubscribersContinue( true ) } primary>
							{ translate( 'Yes, set up payments for subscribers' ) }
						</Button>
						<br /> <br />
						<Button onClick={ () => paidSubscribersContinue( false ) }>
							{ translate( 'Not at this time' ) }
						</Button>
					</div>
				</>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default PaidSubscribers;
