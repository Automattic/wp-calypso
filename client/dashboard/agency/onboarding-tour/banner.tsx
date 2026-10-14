import clsx from 'clsx';
import agencyTiers from './images/tour/agency-tiers.svg';
import glow from './images/tour/glow.jpg';
import growthCall from './images/tour/growth-call.svg';
import marketplace from './images/tour/marketplace.svg';
import migrations from './images/tour/migrations.svg';
import overview from './images/tour/overview.svg';
import partnerDirectory from './images/tour/partner-directory.svg';
import purchases from './images/tour/purchases.svg';
import referrals from './images/tour/referrals.svg';
import sites from './images/tour/sites.svg';
import team from './images/tour/team.svg';
import woopayments from './images/tour/woopayments.svg';
import type { OnboardingTourSectionId } from './sections';

// Figma “Marketplace Graphics” › Tour drawings U: one idea per section, white cards on a
// transparent canvas. The field and the cards' shadow are CSS (style.scss).
const DRAWINGS: Record< OnboardingTourSectionId, string > = {
	overview,
	sites,
	marketplace,
	purchases,
	referrals,
	migrations,
	woopayments,
	'partner-directory': partnerDirectory,
	'agency-tiers': agencyTiers,
	team,
	'growth-call': growthCall,
};

export default function OnboardingTourBanner( {
	sectionId,
	isVisible,
}: {
	sectionId: OnboardingTourSectionId;
	isVisible: boolean;
} ) {
	return (
		<div
			className={ clsx( 'a4a-onboarding-tour__banner', 'a4a-onboarding-tour-field', {
				'is-visible': isVisible,
			} ) }
			style={ { backgroundImage: `url(${ glow })` } }
		>
			<img className="a4a-onboarding-tour-field__drawing" src={ DRAWINGS[ sectionId ] } alt="" />
		</div>
	);
}
