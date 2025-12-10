import {
	Card,
	CardBody,
	CardHeader,
	CardMedia,
	__experimentalHeading as Heading,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function TopResources() {
	return (
		<>
			<Spacer marginBottom={ 4 }>
				<Heading level={ 2 } weight={ 500 } size={ 20 }>
					{ __( 'Top resources' ) }
				</Heading>
			</Spacer>

			<HStack spacing={ 6 } style={ { justifyContent: 'space-between' } } alignment="stretch">
				<Card isBorderless size="none" style={ { width: '33%' } }>
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
									'This is a dummy text placeholder for the first top resource card. Replace with actual content.'
								) }
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card isBorderless size="none" style={ { width: '33%' } }>
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
									'This is a dummy text placeholder for the first top resource card. Replace with actual content.'
								) }
							</Text>
						</VStack>
					</CardBody>
				</Card>

				<Card isBorderless size="none" style={ { width: '33%' } }>
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
									'This is a dummy text placeholder for the first top resource card. Replace with actual content.'
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
