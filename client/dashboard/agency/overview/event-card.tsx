import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { Text } from '../../components/text';
import {
	FEATURED_EVENT,
	PRESSABLE_EXPANSION_OFFER_EVENT,
	PRESSABLE_INTRO_OFFER_EVENT,
} from './events';
import NewTabLabel from './new-tab-label';
import type { FeaturedEvent } from './events';
import type { RecordTracksEvent } from '../tiers/types';

interface EventCardProps {
	isEligibleForPressableIntroOffer?: boolean;
	isEligibleForPressableExpansionOffer?: boolean;
	recordTracksEvent?: RecordTracksEvent;
}

function SingleEventCard( {
	event,
	recordTracksEvent,
}: {
	event: FeaturedEvent;
	recordTracksEvent?: RecordTracksEvent;
} ) {
	const { id, logo, logoAlt, when, title, subtitle, description, ctas } = event;

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<HStack spacing={ 3 } justify="flex-start" alignment="center">
						{ logo && <img src={ logo } alt={ logoAlt ?? '' } width={ 64 } height={ 64 } /> }
						<VStack spacing={ 1 }>
							<Text variant="muted" size={ 11 } weight={ 500 } lineHeight="16px" upperCase>
								{ when }
							</Text>
							<Heading level={ 2 } size={ 15 } weight={ 500 } lineHeight="20px">
								{ title }
							</Heading>
							<Text variant="muted" size={ 12 } lineHeight="16px">
								{ subtitle }
							</Text>
						</VStack>
					</HStack>
					<VStack spacing={ 4 }>
						{ description.map( ( paragraph ) => (
							<Text key={ paragraph } size={ 13 } lineHeight="20px">
								{ paragraph }
							</Text>
						) ) }
					</VStack>
					<ButtonStack justify="flex-start">
						{ ctas.map( ( cta ) => (
							<Button
								key={ cta.id }
								size="compact"
								variant={ cta.variant ?? 'secondary' }
								href={ cta.url }
								target={ cta.isExternal ? '_blank' : undefined }
								rel={ cta.isExternal ? 'noreferrer' : undefined }
								onClick={ () =>
									recordTracksEvent?.( 'calypso_a4a_overview_event_cta_click', {
										event_id: id,
										cta_id: cta.id,
									} )
								}
							>
								{ cta.isExternal ? <NewTabLabel>{ cta.label }</NewTabLabel> : cta.label }
							</Button>
						) ) }
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}

export default function EventCard( {
	isEligibleForPressableIntroOffer,
	isEligibleForPressableExpansionOffer,
	recordTracksEvent,
}: EventCardProps ) {
	const now = new Date();
	const events = [
		FEATURED_EVENT,
		isEligibleForPressableIntroOffer ? PRESSABLE_INTRO_OFFER_EVENT : null,
		isEligibleForPressableExpansionOffer ? PRESSABLE_EXPANSION_OFFER_EVENT : null,
	].filter( ( event ): event is FeaturedEvent => !! event && now < new Date( event.endsAt ) );

	if ( ! events.length ) {
		return null;
	}

	return (
		<>
			{ events.map( ( event ) => (
				<SingleEventCard key={ event.id } event={ event } recordTracksEvent={ recordTracksEvent } />
			) ) }
		</>
	);
}
