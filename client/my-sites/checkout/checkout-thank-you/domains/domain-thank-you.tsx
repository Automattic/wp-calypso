import { useMemo } from 'react';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { ThankYou } from 'calypso/components/thank-you';
import domainThankYouContent from 'calypso/my-sites/checkout/checkout-thank-you/domains/thank-you-content';
import {
	DomainThankYouProps,
	DomainThankYouType,
} from 'calypso/my-sites/checkout/checkout-thank-you/domains/types';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/masterbar-visibility/actions';

import './style.scss';

interface DomainThankYouContainerProps {
	domain: string;
	email: string;
	hasProfessionalEmail: boolean;
	hideProfessionalEmailStep: boolean;
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
	}, [ type, domain, selectedSiteSlug, email, hasProfessionalEmail, hideProfessionalEmailStep ] );
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( hideMasterbar() );
		return () => {
			dispatch( showMasterbar() );
		};
	}, [ dispatch ] );

	return (
		<ThankYou
			headerBackgroundColor="var( --studio-white )"
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
