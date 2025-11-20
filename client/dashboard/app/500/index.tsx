import config from '@automattic/calypso-config';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';

function UnknownError( { error }: { error: Error } ) {
	useEffect( () => {
		logToLogstash( {
			feature: 'calypso_client',
			message: 'Unknown error',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			tags: [ 'dashboard' ],
			extra: {
				env: config( 'env_id' ),
				message: error.message,
			},
		} );
	}, [ error ] );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ __( '500 Error' ) }
					description={ __( 'Something wrong happened.' ) }
					actions={
						<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
							{ __( 'Go to Sites' ) }
						</RouterLinkButton>
					}
				/>
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
