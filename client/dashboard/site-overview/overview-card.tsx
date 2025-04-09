import { Badge } from '@automattic/components';
import {
	Card,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Icon,
	ProgressBar,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';
interface OverviewCardProps {
	title: string;
	heading?: string;
	customHeading?: ReactNode;
	icon?: ReactNode;
	badge?: string;
	metaText?: string;
	isLink?: boolean;
	children?: ReactNode;
}

export default function OverviewCard( {
	title,
	heading,
	customHeading,
	icon,
	badge,
	metaText,
	isLink,
	children,
}: OverviewCardProps ) {
	// TODO: handle `isLink`..
	return (
		<Card className="site-overview-card">
			<VStack spacing={ 4 }>
				<HStack justify="space-between">
					<Text variant="muted">
						{ title }
						{ isLink && (
							<span
								className="components-external-link__icon"
								aria-label={
									/* translators: accessibility text */
									__( '(opens in a new tab)' )
								}
							>
								&#8599;
							</span>
						) }
					</Text>

					{ icon && <Icon className="overview-card-icon" icon={ icon } /> }
				</HStack>
				<HStack justify="flex-start" alignment="baseline">
					{ customHeading ? (
						customHeading
					) : (
						<>
							<Heading level={ 2 }>{ heading }</Heading>
							{ metaText && <Text variant="muted">{ metaText }</Text> }
						</>
					) }
				</HStack>
				{ children }
				{ badge && <Badge>{ badge }</Badge> }
			</VStack>
		</Card>
	);
}

export function OverviewCardProgressBar( { value }: { value: number } ) {
	return <ProgressBar className="overview-card-progress-bar" value={ value } />;
}
