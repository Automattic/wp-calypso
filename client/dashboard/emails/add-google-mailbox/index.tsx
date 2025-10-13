import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';

export default function AddGoogleMailbox() {
	return (
		<PageLayout header={ <PageHeader /> } size="small">
			<Text size={ 18 }>{ __( 'Add a Google mailbox' ) }</Text>
		</PageLayout>
	);
}
