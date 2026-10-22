import { __experimentalVStack as VStack } from '@wordpress/components';
import { ButtonStack } from '../../../components/button-stack';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';

export function MigrationCard( {
	title,
	description,
	decoration,
	actions,
	footer,
	children,
}: {
	title: React.ReactNode;
	description?: React.ReactNode;
	decoration?: React.ReactNode;
	actions?: React.ReactNode;
	footer?: React.ReactNode;
	children?: React.ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ title }
							description={ description }
							decoration={ decoration }
							level={ 3 }
							className="wordpress-migration__card-header"
						/>
						{ children }
					</VStack>
					{ actions && (
						<ButtonStack justify="flex-start" wrap>
							{ actions }
						</ButtonStack>
					) }
					{ footer }
				</VStack>
			</CardBody>
		</Card>
	);
}
