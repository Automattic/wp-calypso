import { useMemo } from 'react';
import * as React from 'react';
import { ThankYou } from 'calypso/components/thank-you';
import domainThankYouContent from './thank-you-content';
import { DomainThankYouProps, DomainThankYouType } from './types';

import './style.scss';

interface DomainThankYouContainerProps {
	domain: string;
	email: string;
	hasProfessionalEmail: boolean;
	hideProfessionalEmailStep: boolean;
	includeInbox: string;
	selectedSiteSlug: string;
	type: DomainThankYouType;
}

const DomainThankYou: React.FC< DomainThankYouContainerProps > = ( {
	domain,
	email,
	hasProfessionalEmail,
	selectedSiteSlug,
	hideProfessionalEmailStep,
	type,
} ) => {
	const thankYouProps = useMemo< DomainThankYouProps >( () => {
		const propsGetter = domainThankYouContent[ type ];
		return propsGetter( {
			selectedSiteSlug,
			domain,
			email,
			hasProfessionalEmail,
			hideProfessionalEmailStep,
		} );
	}, [ type, domain, selectedSiteSlug, email ] );

	return (
		<ThankYou
			containerClassName="checkout-thank-you__domains"
			sections={ thankYouProps.sections }
			showSupportSection={ true }
			thankYouImage={ thankYouProps.thankYouImage }
			thankYouTitle={ thankYouProps.thankYouTitle }
			thankYouSubtitle={ thankYouProps.thankYouSubtitle }
			thankYouNotice={ thankYouProps.thankYouNotice }
		/>
	);
};

export default DomainThankYou;
