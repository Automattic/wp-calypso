import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Spinner,
	__experimentalText as Text,
} from '@wordpress/components';
import type { ReactNode } from 'react';

interface FlexUsageCardProps {
	title: string;
	description?: ReactNode;
	isLoading?: boolean;
	children?: ReactNode;
}

export default function FlexUsageCard( {
	title,
	description,
	isLoading,
	children,
}: FlexUsageCardProps ) {
	return (
		<Card style={ { flexGrow: 1 } } className="flex-usage-card">
			<CardBody>
				<VStack spacing={ 4 } justify="flex-start">
					<HStack justify="space-between" alignment="flex-start">
						<VStack spacing={ 4 }>
							<Text weight="bold" size="15px">
								{ title }
							</Text>
							<HStack justify="flex-start" alignment="baseline">
								<Text variant="muted">{ description || <>&nbsp;</> }</Text>
							</HStack>
						</VStack>
					</HStack>
					{ children && (
						<VStack spacing={ 2 } justify="space-between">
							{ isLoading ? <Spinner /> : children }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
