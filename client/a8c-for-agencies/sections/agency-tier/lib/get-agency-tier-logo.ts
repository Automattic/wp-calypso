import AgencyPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-partner-logo-small.svg';
import EmergingPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/emerging-partner-logo-small.svg';
import ProAgencyPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/pro-agency-partner-logo-small.svg';

const getAgencyTierLogo = (
	agencyTier: 'emerging-partner' | 'agency-partner' | 'pro-agency-partner'
) => {
	switch ( agencyTier ) {
		case 'emerging-partner':
			return EmergingPartnerLogo;
		case 'agency-partner':
			return AgencyPartnerLogo;
		case 'pro-agency-partner':
			return ProAgencyPartnerLogo;
	}
};

export default getAgencyTierLogo;
