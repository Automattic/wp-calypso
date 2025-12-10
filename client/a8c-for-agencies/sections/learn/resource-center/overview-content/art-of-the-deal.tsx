import {
	Card,
	CardHeader,
	CardMedia,
	CardBody,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ArtOfTheDeal() {
	return (
		<>
			<Spacer marginBottom={ 6 }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ __( 'The art of the deal' ) }
				</Heading>
				<Text size={ 15 }>
					{ __( 'Learn tips from our world-class sales team to win clients!' ) }
				</Text>
			</Spacer>

			<HStack spacing={ 6 } style={ { justifyContent: 'space-between' } } alignment="stretch">
				<Card isBorderless size="none" style={ { width: '50%' } }>
					<CardMedia style={ { borderRadius: '4px' } }>
						<img src="https://placehold.co/600x250" alt="Deal Strategy Card 1" />
					</CardMedia>
					<CardHeader
						size={ {
							blockStart: 'small',
							blockEnd: 'none',
							inlineStart: 'none',
							inlineEnd: 'none',
						} }
					>
						<Heading level={ 3 } weight={ 500 } size={ 16 }>
							{ __( 'Deal Strategy Card 1' ) }
						</Heading>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 2 }>
							<Text>
								{ __(
									'This is a dummy text placeholder for the first art of the deal card. Replace with actual content.'
								) }
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card isBorderless size="none" style={ { width: '50%' } }>
					<CardMedia style={ { borderRadius: '4px' } }>
						<img src="https://placehold.co/600x250" alt="Deal Strategy Card 2" />
					</CardMedia>
					<CardHeader
						size={ {
							blockStart: 'small',
							blockEnd: 'none',
							inlineStart: 'none',
							inlineEnd: 'none',
						} }
					>
						<Heading level={ 3 } weight={ 500 } size={ 16 }>
							{ __( 'Deal Strategy Card 2' ) }
						</Heading>
					</CardHeader>
					<CardBody>
						<VStack spacing={ 2 }>
							<Text>
								{ __(
									'This is a dummy text placeholder for the second art of the deal card. Replace with actual content.'
								) }
							</Text>
						</VStack>
					</CardBody>
				</Card>
			</HStack>

			<Spacer marginBottom={ 12 } />
		</>
	);
}
