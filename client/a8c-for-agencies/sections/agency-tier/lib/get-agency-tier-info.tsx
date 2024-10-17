import AgencyPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-partner-logo-small.svg';
import EmergingPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/emerging-partner-logo-small.svg';
import ProAgencyPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/pro-agency-partner-logo-small.svg';
import { preventWidows } from 'calypso/lib/formatting';

const getAgencyTierInfo = (
	agencyTier: 'emerging-partner' | 'agency-partner' | 'pro-agency-partner',
	translate: ( key: string, args?: Record< string, unknown > ) => string
) => {
	let tierInfo = {
		title: '',
		fullTitle: '',
		subtitle: '',
		logo: '',
		includedTiers: [] as string[],
	};
	switch ( agencyTier ) {
		case 'emerging-partner':
			tierInfo = {
				title: translate( 'Emerging Partner' ),
				fullTitle: translate(
					"{{label}}You're currently an{{/label}} {{title}}Emerging Partner{{/title}}",
					{
						components: {
							label: <div className="agency-tier-overview__current-agency-tier-label"></div>,
							title: <div className="agency-tier-overview__current-agency-tier-title"></div>,
						},
					}
				),
				subtitle: translate(
					'Your next tier milestone is when your influenced revenue exceeds %(amount)s',
					{ args: { amount: '$1,200' }, comment: 'Amount of revenue' }
				),
				logo: EmergingPartnerLogo,
				includedTiers: [ 'emerging-partner' ],
			};
			break;
		case 'agency-partner':
			tierInfo = {
				title: translate( 'Agency Partner' ),
				fullTitle: translate(
					"{{label}}You're currently an{{/label}} {{title}}Agency Partner{{/title}}",
					{
						components: {
							label: <div className="agency-tier-overview__current-agency-tier-label"></div>,
							title: <div className="agency-tier-overview__current-agency-tier-title"></div>,
						},
					}
				),
				subtitle: translate(
					'Your next tier milestone is when your influenced revenue exceeds %(amount)s',
					{
						args: { amount: '$5,000' },
						comment: 'Amount of revenue',
					}
				),
				logo: AgencyPartnerLogo,
				includedTiers: [ 'emerging-partner', 'agency-partner' ],
			};
			break;
		case 'pro-agency-partner':
			tierInfo = {
				title: translate( 'Pro Agency Partner' ),
				fullTitle: translate(
					"{{label}}You're currently a{{/label}} {{title}}Pro Agency Partner{{/title}}",
					{
						components: {
							label: <div className="agency-tier-overview__current-agency-tier-label"></div>,
							title: <div className="agency-tier-overview__current-agency-tier-title"></div>,
						},
					}
				),
				subtitle: preventWidows( translate( "You've reached the highest tier!" ) ),
				logo: ProAgencyPartnerLogo,
				includedTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
			};
	}
	return { id: agencyTier, ...tierInfo };
};

export default getAgencyTierInfo;
