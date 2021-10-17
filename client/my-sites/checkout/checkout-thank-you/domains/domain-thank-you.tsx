import { useMemo } from 'react';
import * as React from 'react';
import { ThankYou } from 'calypso/components/thank-you';
import domainThankYouContent from './thank-you-content';
import { DomainThankYouProps, DomainThankYouType } from './types';

import './style.scss';

interface DomainThankYouContainerProps {
	type: DomainThankYouType;
	domain: string;
	includeInbox: string;
	email: string;
	selectedSiteSlug: string;
}

const DomainThankYou: React.FC< DomainThankYouContainerProps > = ( {
	type,
	domain,
	email,
	selectedSiteSlug,
	hasProfessionalEmail,
} ) => {
	const thankYouProps = useMemo< DomainThankYouProps >( () => {
		const propsGetter = domainThankYouContent[ type ];
		return propsGetter( { selectedSiteSlug, domain, email, hasProfessionalEmail } );
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
