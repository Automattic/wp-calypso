import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Onboard } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import FlowCard from '../components/flow-card';
import { IconPaid, IconFree, IconImport } from './icons';
import type { Step } from '../../types';
import './style.scss';

const NewsletterGoals: Step = ( { navigation } ) => {
	const { submit } = navigation;
	const translate = useTranslate();

	const { setGoals, resetGoals } = useDispatch( ONBOARD_STORE );

	const handleSubmit = ( goal: Onboard.SiteGoal | null ) => {
		if ( goal ) {
			setGoals( [ goal ] );
		} else {
			// Clears goals entirely each time in case they returned to this step, regardless if goals were set previously or not.
			// We could instead just avoid doing anything if nothing wasn't set ever.
			resetGoals();
		}

		recordTracksEvent( 'calypso_signup_newsletter_goal_click', {
			goal: goal?.toString() ?? 'free',
		} );

		submit?.();
	};

	return (
		<StepContainer
			goBack={ navigation.goBack }
			stepName="newsletter-type"
			isWideLayout
			flowName="newsletter"
			formattedHeader={
				<FormattedHeader
					id="newsletter-setup-header"
					headerText={ translate( 'Choose a way to get started' ) }
					align="center"
				/>
			}
			stepContent={
				<VStack alignment="top" spacing="2">
					<FlowCard
						icon={ IconFree }
						title={ translate( 'Free newsletter' ) }
						text={ translate(
							'Start a newsletter with free content and grow your audience. You can always monetize it later.'
						) }
						onClick={ () => handleSubmit( null ) }
					/>
					<FlowCard
						icon={ IconPaid }
						title={ translate( 'Paid newsletter' ) }
						text={ translate(
							'Add paid subscriptions and gated content to allow your readers to support your work.'
						) }
						onClick={ () => handleSubmit( Onboard.SiteGoal.PaidSubscribers ) }
					/>
					<FlowCard
						icon={ IconImport }
						title={ translate( 'Import an existing newsletter' ) }
						text={ translate(
							'Bring your subscribers along from another platform to your free or paid newsletter.'
						) }
						onClick={ () => handleSubmit( Onboard.SiteGoal.ImportSubscribers ) }
					/>
				</VStack>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default NewsletterGoals;
