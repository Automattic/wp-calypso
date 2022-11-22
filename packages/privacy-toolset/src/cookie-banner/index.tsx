import { useCallback, useState } from 'react';
import { CustomizedConsent } from './customized-consent';
import { SimpleConsent } from './simple-consent';
import { Buckets, CustomizedConsentContent, SimpleConsentContent } from './types';

import './styles.scss';

export type CookieBannerProps = {
	content: {
		simpleConsent: SimpleConsentContent;
		customizedConsent: CustomizedConsentContent;
	};
	onAccept: ( buckets: Buckets ) => void;
};

enum ConsentViewType {
	Simple,
	Customized,
}

export const CookieBanner = ( { content, onAccept }: CookieBannerProps ) => {
	const [ viewType, setViewType ] = useState< ConsentViewType >( ConsentViewType.Simple );
	const handleSetCustomizedView = () => {
		setViewType( ConsentViewType.Customized );
	};
	const handleAcceptAll = useCallback( () => {
		onAccept( { essential: true, analytics: true, advertising: true } );
	}, [ onAccept ] );

	return (
		<div className="cookie-banner">
			{ ConsentViewType.Simple === viewType && (
				<SimpleConsent
					content={ content.simpleConsent }
					onAcceptAll={ handleAcceptAll }
					onCustomize={ handleSetCustomizedView }
				/>
			) }
			{ ConsentViewType.Customized === viewType && (
				<CustomizedConsent content={ content.customizedConsent } onAccept={ onAccept } />
			) }
		</div>
	);
};
