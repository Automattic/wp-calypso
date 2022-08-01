import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isThemePremium as getIsThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './premium-theme-badge.scss';

const PremiumThemeBadge = ( { theme } ) => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) ) || -1;
	const isThemePremium = useSelector( ( state ) => getIsThemePremium( state, theme.id ) );
	const hasPremiumThemesFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES )
	);
	const didPurchaseTheme = useSelector( ( state ) => isThemePurchased( state, theme.id, siteId ) );

	if ( ! isThemePremium ) {
		return null;
	}
	if ( didPurchaseTheme ) {
		return (
			<InfoPopover icon="star" className="premium-theme-badge__icon" position="top" showOnHover>
				<div class="premium-theme-badge__popover-container">
					<h4>Premium theme</h4>
					<p>You have purchased an annual subscription for this theme.</p>
				</div>
			</InfoPopover>
		);
	}
	if ( hasPremiumThemesFeature ) {
		return (
			<InfoPopover icon="star" className="premium-theme-badge__icon" position="top" showOnHover>
				<div class="premium-theme-badge__popover-container">
					<h4>Premium theme</h4>
					<p>This premium theme is included in your plan.</p>
				</div>
			</InfoPopover>
		);
	}
	return (
		<InfoPopover
			icon="star"
			className="premium-theme-badge__icon premium-theme-badge__not-available"
			position="top"
			showOnHover
			show
		>
			<div class="premium-theme-badge__popover-container">
				<h4>Premium theme</h4>
				<p>
					This premium theme is included in the Premium plan, or you can purchase individually for
					... a year.
				</p>
			</div>
		</InfoPopover>
	);
	// return <div>Premium, but has not purchased and no feature</div>;
};
export default PremiumThemeBadge;
