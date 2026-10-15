import {
	Card,
	CardBody,
	CardDivider,
	CardFooter,
	ColorIndicator,
	FlexItem,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import type { DesignBrief } from './api';
import type { ReactNode } from 'react';

const COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export default function BriefDirection( {
	brief,
	pending,
	children,
}: {
	brief: DesignBrief;
	pending: boolean;
	children: ReactNode;
} ) {
	const colors = brief.palette?.colors?.filter( ( color ) => COLOR.test( color ) ) ?? [];
	const rows: [ string, ReactNode ][] = [];
	if ( brief.mood_keywords?.length ) {
		rows.push( [
			__( 'The feeling' ),
			<HStack key="feeling" justify="flex-start" wrap spacing={ 2 }>
				{ brief.mood_keywords.map( ( mood ) => (
					<FlexItem key={ mood }>
						<Badge intent="draft">{ mood }</Badge>
					</FlexItem>
				) ) }
			</HStack>,
		] );
	}
	if ( brief.typography?.headings || brief.typography?.body ) {
		rows.push( [
			__( 'The type' ),
			<VStack key="type" spacing={ 5 }>
				{ brief.typography.headings && (
					<VStack spacing={ 1 }>
						<Text upperCase variant="muted" size={ 12 }>
							{ __( 'Headings' ) }
						</Text>
						<Text size={ 14 }>{ brief.typography.headings }</Text>
					</VStack>
				) }
				{ brief.typography.body && (
					<VStack spacing={ 1 }>
						<Text upperCase variant="muted" size={ 12 }>
							{ __( 'Body' ) }
						</Text>
						<Text size={ 14 }>{ brief.typography.body }</Text>
					</VStack>
				) }
			</VStack>,
		] );
	}
	if ( colors.length || brief.palette?.description ) {
		rows.push( [
			__( 'The palette' ),
			<VStack key="palette" spacing={ 5 }>
				{ brief.palette?.description && (
					<Text variant="muted" size={ 14 }>
						{ brief.palette.description }
					</Text>
				) }
				{ colors.length > 0 && (
					<HStack justify="flex-start" spacing={ 5 } wrap>
						{ colors.map( ( color ) => (
							<FlexItem key={ color }>
								<HStack spacing={ 2 } expanded={ false }>
									<ColorIndicator colorValue={ color } aria-hidden="true" />
									<Text as="code" size={ 13 }>
										{ color.toUpperCase() }
									</Text>
								</HStack>
							</FlexItem>
						) ) }
					</HStack>
				) }
			</VStack>,
		] );
	}
	if ( brief.audience ) {
		rows.push( [
			__( 'Audience' ),
			<Text key="audience" size={ 14 }>
				{ brief.audience }
			</Text>,
		] );
	}
	if ( brief.references?.length ) {
		rows.push( [
			__( 'References' ),
			<VStack key="references" spacing={ 2 }>
				{ brief.references.map( ( reference ) => (
					<Text key={ reference } size={ 14 }>
						{ reference }
					</Text>
				) ) }
			</VStack>,
		] );
	}
	return (
		<VStack spacing={ 6 } className="site-redesign-direction">
			<HStack alignment="center" justify="flex-start" expanded={ false } spacing={ 3 } wrap>
				<FlexItem>
					<Heading level={ 1 } size={ 24 } weight={ 400 }>
						{ __( 'Design brief' ) }
					</Heading>
				</FlexItem>
				<FlexItem>
					<Badge intent="informational">
						{ pending ? __( 'Ready to generate' ) : __( 'Behind your new design' ) }
					</Badge>
				</FlexItem>
			</HStack>
			<Card size="large">
				<CardBody>
					<VStack spacing={ 4 }>
						<Heading level={ 2 } size={ 20 } weight={ 500 }>
							{ brief.goal }
						</Heading>
						<Text as="p" variant="muted" size={ 14 }>
							{ brief.style }
						</Text>
					</VStack>
				</CardBody>
				{ rows.map( ( [ label, detail ] ) => (
					<VStack key={ label } spacing={ 0 }>
						<CardDivider />
						<CardBody>
							<HStack
								alignment="topLeft"
								spacing={ 6 }
								className="site-redesign-brief-row"
								role="group"
								aria-label={ label }
							>
								<FlexItem className="site-redesign-brief-label">
									<Text upperCase size={ 12 }>
										{ label }
									</Text>
								</FlexItem>
								<VStack spacing={ 0 }>{ detail }</VStack>
							</HStack>
						</CardBody>
					</VStack>
				) ) }
				<CardFooter className="site-redesign-brief-footer" gap={ 6 }>
					{ children }
				</CardFooter>
			</Card>
		</VStack>
	);
}
