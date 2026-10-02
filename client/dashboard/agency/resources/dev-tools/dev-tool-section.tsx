import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { Card, CardBody, CardMedia } from '../../../components/card';
import type { CSSProperties } from 'react';

export type DevToolImagePosition = 'center' | 'bottom-left' | 'bottom-right';

const IMAGE_POSITION_STYLES: Record< DevToolImagePosition, CSSProperties > = {
	center: { alignItems: 'center', justifyContent: 'center' },
	'bottom-left': { alignItems: 'flex-end', justifyContent: 'flex-start' },
	'bottom-right': { alignItems: 'flex-end', justifyContent: 'flex-end' },
};

interface DevToolSectionProps {
	name: string;
	badge: string;
	tagline: string;
	description: string;
	features: string[];
	cta: {
		label: string;
		href: string;
		onClick: () => void;
	};
	image: string;
	imagePosition: DevToolImagePosition;
}

export default function DevToolSection( {
	name,
	badge,
	tagline,
	description,
	features,
	cta,
	image,
	imagePosition,
}: DevToolSectionProps ) {
	return (
		<Card size="large">
			<CardMedia
				style={ {
					display: 'flex',
					aspectRatio: '8 / 5',
					backgroundColor: 'var( --dashboard-resource-media__background-color )',
					...IMAGE_POSITION_STYLES[ imagePosition ],
				} }
			>
				<img src={ image } alt="" style={ { width: 'auto', maxWidth: '100%', height: '84%' } } />
			</CardMedia>
			<CardBody>
				<VStack spacing={ 4 } alignment="flex-start">
					<VStack spacing={ 2 }>
						<HStack alignment="left" wrap>
							<Heading level={ 2 } size={ 20 } weight={ 500 }>
								{ name }
							</Heading>
							<Badge intent="draft">{ badge }</Badge>
						</HStack>
						<Text weight={ 500 }>{ tagline }</Text>
					</VStack>
					<Text size={ 15 }>{ description }</Text>
					<VStack
						as="ul"
						role="list"
						spacing={ 1 }
						style={ { margin: 0, padding: 0, listStyle: 'none' } }
					>
						{ features.map( ( feature ) => (
							<HStack as="li" key={ feature } alignment="topLeft" spacing={ 1 }>
								<Icon
									icon={ check }
									size={ 24 }
									style={ { flexShrink: 0, fill: 'var(--wp-admin-theme-color)' } }
								/>
								<Text size={ 15 } lineHeight="24px">
									{ feature }
								</Text>
							</HStack>
						) ) }
					</VStack>
					<Button
						variant="primary"
						__next40pxDefaultSize
						href={ cta.href }
						target="_blank"
						rel="noreferrer"
						onClick={ cta.onClick }
					>
						{ cta.label }
					</Button>
				</VStack>
			</CardBody>
		</Card>
	);
}
