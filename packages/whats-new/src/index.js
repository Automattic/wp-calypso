import { useLocale } from '@automattic/i18n-utils';
import { Guide } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import wpcom from 'wpcom';
import proxyRequest from 'wpcom-proxy-request';
import WhatsNewPage from './whats-new-page';
import './style.scss';

const WhatsNewGuide = ( { onClose } ) => {
	const [ whatsNewData, setWhatsNewData ] = useState( null );
	const __ = useI18n().__;
	const locale = useLocale();

	// Load What's New list on first site load
	useEffect( () => {
		const proxiedWpcom = wpcom();
		proxiedWpcom.request = proxyRequest;
		proxiedWpcom.req
			.get( { path: `/whats-new/list?_locale=${ locale }`, apiNamespace: 'wpcom/v2' } )
			.then( ( returnedList ) => {
				setWhatsNewData( returnedList );
			} );
	}, [ locale ] );

	if ( ! whatsNewData ) {
		return null;
	}

	return (
		<Guide
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="whats-new-guide__main"
			contentLabel={ __( "What's New at WordPress.com", __i18n_text_domain__ ) }
			finishButtonText={ __( 'Done', __i18n_text_domain__ ) }
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
					onClose={ onClose }
				/>
			) ) }
		</Guide>
	);
};

export default WhatsNewGuide;
