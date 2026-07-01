import { JETPACK_SUPPORT_CONNECTION_ISSUES } from '@automattic/urls';
import { Button, ExternalLink, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { Notice } from '../../components/notice';
import JetpackSiteDisconnect from '../jetpack-site-disconnect';
import type { Site } from '@automattic/api-core';

export function InaccessibleJetpackNotice( { error, site }: { error: Error; site?: Site } ) {
	const [ showRemoveSiteModal, setShowRemoveSiteModal ] = useState( false );

	useEffect( () => {
		logToLogstash( {
			feature: 'calypso_client',
			message: error.message,
			tags: [ 'dashboard', 'jetpack-inaccessible' ],
			properties: {
				path: window.location.href,
			},
		} );
	}, [ error.message ] );

	return (
		<>
			<Notice
				variant="error"
				title={ __( 'Your Jetpack site cannot be reached at this time.' ) }
				actions={
					<>
						<ExternalLink href={ JETPACK_SUPPORT_CONNECTION_ISSUES }>
							{ __( 'Troubleshoot your Jetpack connection' ) }
						</ExternalLink>
						{ site && (
							<Button
								__next40pxDefaultSize
								variant="secondary"
								isDestructive
								onClick={ () => setShowRemoveSiteModal( true ) }
							>
								{ __( 'Remove site' ) }
							</Button>
						) }
					</>
				}
			>
				{ error.message }
			</Notice>
			{ showRemoveSiteModal && site && (
				<Modal
					title={ __( 'Remove site' ) }
					size="medium"
					onRequestClose={ () => setShowRemoveSiteModal( false ) }
				>
					<JetpackSiteDisconnect site={ site } onClose={ () => setShowRemoveSiteModal( false ) } />
				</Modal>
			) }
		</>
	);
}
