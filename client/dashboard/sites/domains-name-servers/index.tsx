import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import NameServersForm from './form';
import './styles.scss';

export default function NameServers() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody className="domains-management__name-servers">
					<NameServersForm />
				</CardBody>
			</Card>
		</PageLayout>
	);
}
