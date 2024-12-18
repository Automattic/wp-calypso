import AgencyPartnerBackground from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-partner-background.svg';
import AgencyPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/agency-partner-logo-small.svg';
import EmergingPartnerBackground from 'calypso/assets/images/a8c-for-agencies/agency-tier/emerging-partner-background.svg';
import EmergingPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/emerging-partner-logo-small.svg';
import NoTierLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/no-tier-logo-small.svg';
import ProAgencyPartnerBackground from 'calypso/assets/images/a8c-for-agencies/agency-tier/pro-agency-partner-background.svg';
import ProAgencyPartnerLogo from 'calypso/assets/images/a8c-for-agencies/agency-tier/pro-agency-partner-logo-small.svg';
import { preventWidows } from 'calypso/lib/formatting';
import type { AgencyTierInfo, AgencyTier } from '../types';

const getAgencyTierInfo = (
	agencyTier: AgencyTier | undefined,
	translate: ( key: string, args?: Record< string, unknown > ) => string
) => {
	let tierInfo: AgencyTierInfo = {
		title: translate( '{{b}}Activate your account{{/b}} by {{b}}making your first purchase{{/b}}', {
			components: { b: <b /> },
		} ),
		fullTitle: translate(
			'{{title}}Activate your account{{/title}} {{label}}by making your first purchase{{/label}}',
			{
				components: {
					label: <div className="agency-tier-overview__current-agency-tier-label"></div>,
					title: <div className="agency-tier-overview__current-agency-tier-title"></div>,
				},
			}
		),
		subtitle: translate(
			"By making your first purchase you'll maintain access to the agency dashboard."
		),
		description: '',
		logo: NoTierLogo,
		includedTiers: [],
		learnMoreLink: 'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits',
	};
	switch ( agencyTier ) {
		case 'emerging-partner':
			tierInfo = {
				title: translate( 'Account activated' ),
				fullTitle: translate(
					"{{label}}You're on your way to becoming an Automattic Agency Partner{{/label}} {{title}}Account activated{{/title}}",
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
				description: translate(
					'Progress towards the Agency Partner Tier and access extra benefits with additional purchases and referrals.'
				),
				logo: EmergingPartnerLogo,
				includedTiers: [ 'emerging-partner' ],
				celebrationModal: {
					title: translate( "Woo-hoo! You've made your first purchase." ),
					description: translate(
						"Your account is now activated, and you're on your way to reaching the next tier of benefits: Agency Partner."
					),
					video:
						'https://automattic.com/wp-content/uploads/2024/10/emerging_partner_tier_celebration.mp4',
					image: EmergingPartnerBackground,
					cta: translate( 'Learn about Tiers' ),
				},
				learnMoreLink:
					'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits/#account-activated',
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
				description: translate(
					"You're well on your way to becoming a Pro Agency Partner and unlocking even more premium benefits!"
				),
				logo: AgencyPartnerLogo,
				includedTiers: [ 'emerging-partner', 'agency-partner' ],
				celebrationModal: {
					title: translate( "Congrats! You've reached the Agency Partner tier!" ),
					description: translate(
						"You've reached at least $1,200 in influenced revenue and have unlocked these additional benefits:"
					),
					benefits: [
						translate( 'Eligibility for inclusion in our agency directories.' ),
						translate( 'Early access to new Automattic products and features.' ),
					],
					video:
						'https://automattic.com/wp-content/uploads/2024/10/agency_partner_tier_celebration-2.mp4',
					image: AgencyPartnerBackground,
					cta: translate( 'Explore your benefits' ),
				},
				learnMoreLink:
					'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits/#agency-partner',
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
				description: translate(
					"You're the best of the best when it comes to agencies for WordPress! Enjoy your premium benefits!"
				),
				logo: ProAgencyPartnerLogo,
				includedTiers: [ 'emerging-partner', 'agency-partner', 'pro-agency-partner' ],
				celebrationModal: {
					title: translate( "Congratulations, you've reached the Pro Agency Partner tier!" ),
					description: translate(
						"You've reached top-tier status and unlocked these additional benefits:"
					),
					benefits: [
						translate( 'A dedicated partner manager and priority support access.' ),
						translate(
							"Advanced sales training sessions at request to sharpen your team's expertise."
						),
						translate( "Access to pre-qualified leads provided by Automattic's sales teams." ),
						translate( 'Co-marketing opportunities.' ),
						translate( 'Access to the Automattic for Agencies advisory board.' ),
					],
					video:
						'https://automattic.com/wp-content/uploads/2024/10/agency_pro_partner_tier_celebration-2.mp4',
					image: ProAgencyPartnerBackground,
					cta: translate( 'Explore your benefits' ),
				},
				learnMoreLink:
					'https://agencieshelp.automattic.com/knowledge-base/agency-tiering-benefits/#pro-partner',
			};
	}
	return { id: agencyTier, ...tierInfo };
};

export default getAgencyTierInfo;
