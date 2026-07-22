import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

export default function FeatureNotEnabled( {
	title,
	icon,
	message,
}: {
	title: string;
	icon: React.ComponentProps< typeof Icon >[ 'icon' ];
	message: string;
} ) {
	return (
		<PageLayout header={ <PageHeader title={ title } /> }>
			<Card>
				<CardBody>
					<HStack justify="flex-start" spacing={ 2 } expanded={ false }>
						<Icon icon={ icon } />
						<Text variant="muted">{ message }</Text>
					</HStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
