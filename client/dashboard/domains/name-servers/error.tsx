import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function NameServers( { error }: { error: Error } ) {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody>
					<Notice variant="error">{ error.message }</Notice>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
