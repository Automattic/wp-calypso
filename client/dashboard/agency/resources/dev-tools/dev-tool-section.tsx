import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { check } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';
import { Card, CardBody } from '../../../components/card';
import Grid from '../../../components/grid';

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
}

export default function DevToolSection( {
	name,
	badge,
	tagline,
	description,
	features,
	cta,
	image,
}: DevToolSectionProps ) {
	const isLargeViewport = useViewportMatch( 'large' );

	return (
		<Card size="large">
			<CardBody>
				<Spacer padding={ isLargeViewport ? 4 : 0 } marginBottom={ 0 }>
					<Grid columns={ isLargeViewport ? 2 : 1 } gap="2xl" align="center">
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
						<HStack alignment="center">
							<img
								src={ image }
								alt=""
								width={ 400 }
								height={ 300 }
								style={ { maxWidth: '100%', height: 'auto' } }
							/>
						</HStack>
					</Grid>
				</Spacer>
			</CardBody>
		</Card>
	);
}
