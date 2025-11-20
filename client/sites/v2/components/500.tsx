import config from '@automattic/calypso-config';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { PageHeader } from 'calypso/dashboard/components/page-header';
import PageLayout from 'calypso/dashboard/components/page-layout';
import { logToLogstash } from 'calypso/lib/logstash';

function UnknownError( { error }: { error: Error } ) {
	useEffect( () => {
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Unknown error (backport)',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			tags: [ 'dashboard' ],
			extra: {
				env: config( 'env_id' ),
				message: error.message,
			},
		} );
	}, [ error.message ] );

	return (
		<PageLayout
			header={
				<PageHeader title={ __( '500 Error' ) } description={ __( 'Something wrong happened.' ) } />
			}
			notices={
				<Notice status="error" isDismissible={ false }>
					{ error.message }
				</Notice>
			}
		></PageLayout>
	);
}

export default UnknownError;
