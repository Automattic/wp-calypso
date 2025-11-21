import { __ } from '@wordpress/i18n';
import Notice from 'calypso/dashboard/components/notice';
import { PageHeader } from 'calypso/dashboard/components/page-header';
import PageLayout from 'calypso/dashboard/components/page-layout';

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
