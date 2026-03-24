import { __ } from '@wordpress/i18n';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

function UnknownError( { error }: { error: Error } ) {
	return (
		<PageLayout
			header={
				<PageHeader title={ __( '500 Error' ) } description={ __( 'Something wrong happened.' ) } />
			}
			notices={ <Notice variant="error">{ error.message }</Notice> }
		></PageLayout>
	);
}

export default UnknownError;
