import { Onboard } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	Icon,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { chevronRight, reusableBlock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

interface NewsletterOptionProps {
	icon: JSX.Element;
	onClick: () => void;
	text: string;
	title: string;
}

const NewsletterOption = ( { icon, onClick, text, title }: NewsletterOptionProps ) => (
	<Card as="button" size="small" onClick={ onClick }>
		<CardBody>
			<HStack>
				<Icon icon={ icon } size={ 20 } />
				<div>
					<h3>{ title }</h3>
					<p>{ text }</p>
				</div>
				<Icon icon={ chevronRight } size={ 20 } />
			</HStack>
		</CardBody>
	</Card>
);

const NewsletterType: Step = ( { navigation } ) => {
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

		submit?.();
	};

	return (
		<StepContainer
			stepName="newsletter-type"
			isWideLayout={ true }
			hideBack={ true }
			flowName="newsletter"
			formattedHeader={
				<FormattedHeader
					id="newsletter-setup-header"
					headerText={ translate( 'Choose a way to get started.' ) }
					align="center"
				/>
			}
			stepContent={
				<VStack alignment="center" spacing="2">
					<NewsletterOption
						icon={ reusableBlock }
						title={ translate( 'Free newsletter' ) }
						text={ translate(
							'Start a newsletter with free content and grow your audience. You can always monetize it later.'
						) }
						onClick={ () => handleSubmit( null ) }
					/>
					<NewsletterOption
						icon={ reusableBlock }
						title={ translate( 'Paid newsletter' ) }
						text={ translate(
							'Add paid subscriptions and gated content to allow your readers to support your work.'
						) }
						onClick={ () => handleSubmit( Onboard.SiteGoal.PaidSubscribers ) }
					/>
					<NewsletterOption
						icon={ reusableBlock }
						title={ translate( 'Import an existing newsletter' ) }
						text={ translate(
							'Bring your subscribers along from another platform to your free or paid newsletter.'
						) }
						onClick={ () => handleSubmit( Onboard.SiteGoal.ImportSubscribers ) }
					/>
				</VStack>
			}
			recordTracksEvent={ recordTracksEvent }
			showJetpackPowered
		/>
	);
};

export default NewsletterType;
