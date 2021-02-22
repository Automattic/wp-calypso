/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { Guide } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import './style.scss';
import { WhatsNewPage } from './whats-new-page';

const WhatsNewGuide = () => {
	const [ showGuide, setShowGuide ] = useState( true );
	const [ whatsNewData, setWhatsNewData ] = useState( null );
	const __ = useI18n().__;

	// Load What's New list on first site load
	useEffect( () => {
		const proxiedWpcom = wpcom();
		proxiedWpcom.request = proxyRequest;
		proxiedWpcom.req
			.get( { path: '/whats-new/list', apiNamespace: 'wpcom/v2' } )
			.then( ( returnedList ) => {
				setWhatsNewData( returnedList );
			} );
	}, [] );

	const toggleWhatsNew = () => setShowGuide( false );

	return (
		<>
			{ whatsNewData && showGuide && (
				<Guide
					className="whats-new"
					contentLabel={ __( "What's New at WordPress.com" ) }
					finishButtonText={ __( 'Close' ) }
					onFinish={ toggleWhatsNew }
				>
					{ whatsNewData.announcements.map( ( page, index ) => (
						<WhatsNewPage
							key={ page.announcementId }
							pageNumber={ index + 1 }
							isLastPage={ index === whatsNewData.announcements.length - 1 }
							{ ...page }
						/>
					) ) }
				</Guide>
			) }
		</>
	);
};

export default WhatsNewGuide;
