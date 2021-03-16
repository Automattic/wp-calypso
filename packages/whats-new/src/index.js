/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { Guide } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { useLocale } from '@automattic/i18n-utils';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';

/**
 * Internal dependencies
 */
import './style.scss';
import WhatsNewPage from './whats-new-page';

const WhatsNewGuide = ( { onClose } ) => {
	const [ whatsNewData, setWhatsNewData ] = useState( null );
	const __ = useI18n().__;
	const locale = useLocale();

	// Load What's New list on first site load
	useEffect( () => {
		const proxiedWpcom = wpcom();
		proxiedWpcom.request = proxyRequest;
		proxiedWpcom.req
			.get( { path: `/whats-new/list?locale=${ locale }`, apiNamespace: 'wpcom/v2' } )
			.then( ( returnedList ) => {
				setWhatsNewData( returnedList );
			} );
	}, [ locale ] );

	if ( ! whatsNewData ) return null;

	return (
		<Guide
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="whats-new-guide__main"
			contentLabel={ __( "What's New at WordPress.com", __i18n_text_domain__ ) }
			finishButtonText={ __( 'Close', __i18n_text_domain__ ) }
			onFinish={ onClose }
		>
			{ whatsNewData.map( ( page, index ) => (
				<WhatsNewPage
					pageNumber={ index + 1 }
					isLastPage={ index === whatsNewData.length - 1 }
					description={ page.description }
					heading={ page.heading }
					imageSrc={ page.imageSrc }
					link={ page.link }
				/>
			) ) }
		</Guide>
	);
};

export default WhatsNewGuide;
