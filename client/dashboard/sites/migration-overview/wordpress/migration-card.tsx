import { __experimentalVStack as VStack } from '@wordpress/components';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';

export function MigrationCard( {
	title,
	description,
	actions,
	children,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	children?: React.ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<SectionHeader title={ title } description={ description } level={ 3 } />
					{ children }
					{ actions && (
						<ButtonStack justify="flex-start" wrap>
							{ actions }
						</ButtonStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
