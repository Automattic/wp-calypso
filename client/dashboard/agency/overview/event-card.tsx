import {
	Button,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { Text } from '../../components/text';
import { FEATURED_EVENT } from './events';
import NewTabLabel from './new-tab-label';
import type { RecordTracksEvent } from '../tiers/types';

interface EventCardProps {
	recordTracksEvent?: RecordTracksEvent;
}

export default function EventCard( { recordTracksEvent }: EventCardProps ) {
	if ( ! FEATURED_EVENT || new Date() >= new Date( FEATURED_EVENT.endsAt ) ) {
		return null;
	}

	const { id, logo, logoAlt, when, title, subtitle, description, ctaLabel, url } = FEATURED_EVENT;

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
						<Button
							size="compact"
							variant="secondary"
							href={ url }
							target="_blank"
							rel="noreferrer"
							onClick={ () =>
								recordTracksEvent?.( 'calypso_a4a_overview_event_register_click', {
									event_id: id,
								} )
							}
						>
							<NewTabLabel>{ ctaLabel }</NewTabLabel>
						</Button>
					</ButtonStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
