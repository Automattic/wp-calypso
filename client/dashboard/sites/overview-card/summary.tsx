import {
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Icon,
} from '@wordpress/components';
import type { OverviewCardSummaryProps } from './types';

export default function OverviewCardSummary( {
	title,
	customHeading,
	description,
	heading,
	icon,
	linkIcon,
}: OverviewCardSummaryProps ) {
	return (
		<VStack spacing={ 4 } style={ { flexGrow: 1, flexShrink: 0 } }>
			<HStack justify="space-between">
				<HStack spacing={ 2 } alignment="center" expanded={ false }>
					{ icon && <Icon className="dashboard-overview-card__icon" icon={ icon } /> }
					<Text
						className="dashboard-overview-card__title"
						variant="muted"
						lineHeight="16px"
						size={ 11 }
						weight={ 500 }
						upperCase
					>
						{ title }
					</Text>
				</HStack>
				{ linkIcon }
			</HStack>
			<HStack justify="flex-start" alignment="baseline">
				{ customHeading ? (
					customHeading
				) : (
					<VStack spacing={ 2 }>
						<Heading level={ 2 } size={ 20 } weight={ 500 }>
							{ heading }
						</Heading>
						{ description && (
							<Text
								className="dashboard-overview-card__description"
								variant="muted"
								lineHeight="16px"
								size={ 12 }
							>
								{ description }
							</Text>
						) }
					</VStack>
				) }
			</HStack>
		</VStack>
	);
}
