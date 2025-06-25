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
import type { ReactElement, ReactNode } from 'react';
import './style.scss';

interface OverviewCardProps {
	title: string;
	heading?: ReactNode;
	customHeading?: ReactNode;
	icon?: ReactElement;
	metaText?: string;
	isLink?: boolean;
	children?: ReactNode;
}

export default function OverviewCard( {
	title,
	heading,
	customHeading,
	icon,
	metaText,
	isLink,
	children,
}: OverviewCardProps ) {
	// TODO: handle `isLink`..
	return (
		<Card className="dashboard-overview-card">
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

					{ icon && <Icon className="dashboard-overview-card__icon" icon={ icon } /> }
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
			</VStack>
		</Card>
	);
}

export function OverviewCardProgressBar( { value }: { value: number | undefined } ) {
	return <ProgressBar className="dashboard-overview-card__progress-bar" value={ value } />;
}
