import { useCallback, useState } from 'react';
import { allBucketsTrue } from './consts';
import { CustomizedConsent } from './customized-consent';
import { SimpleConsent } from './simple-consent';
import type { Buckets, CustomizedConsentContent, SimpleConsentContent } from './types';

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
		onAccept( allBucketsTrue );
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
