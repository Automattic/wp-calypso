import { isWpError } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import Notice from 'calypso/dashboard/components/notice';
import { PageHeader } from 'calypso/dashboard/components/page-header';
import PageLayout from 'calypso/dashboard/components/page-layout';
import { reauthRequiredLink } from 'calypso/dashboard/utils/link';

function UnknownError( { error }: { error: Error } ) {
	if ( isWpError( error ) && error.error === 'reauthorization_required' ) {
		window.location.href = reauthRequiredLink();
		return null;
	}

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
