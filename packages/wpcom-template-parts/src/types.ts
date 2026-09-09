import type { getAutomatticBrandingNoun } from './utils';
import type { useLocalizeUrl } from '@automattic/i18n-utils';

export interface HeaderProps {
	className?: string;
	hideGetStartedCta?: boolean;
	isLoggedIn: boolean;
	sectionName?: string;
	logoColor?: string;
	variant?: 'default' | 'minimal';
	startUrl?: string;
	loginUrl?: string;
	/** Current user's avatar URL, used by the 2026 mobile menu footer when logged in. */
	userAvatar?: string;
	/** Current user's display name, used by the 2026 mobile menu footer when logged in. */
	userName?: string;
	/** Current user's email, used by the 2026 mobile menu footer when logged in. */
	userEmail?: string;
}

export interface FooterProps {
	isLoggedIn?: boolean;
	currentRoute?: string;
	/**
	 * Fills the Company column's `x-nav-footer--ccpa-dnsd` slot — on WPCOM the
	 * twin's do-not-sell script injects its link there. Pass a single anchor
	 * (e.g. a "Do Not Sell or Share My Personal Information" link wired to the
	 * do-not-sell dialog); the empty li renders regardless so the anchor point
	 * always exists.
	 */
	additionalCompanyLinks?: React.ReactNode;
}
export interface PureFooterProps extends FooterProps {
	localizeUrl?: ReturnType< typeof useLocalizeUrl >;
	locale?: string;
	automatticBranding?: ReturnType< typeof getAutomatticBrandingNoun >;
	/** Render the link columns as collapsed tap-to-expand stacks (small screens). */
	collapseStacks?: boolean;
}

export interface MenuItemProps {
	content: string | React.ReactNode;
	className?: string;
	ariaExpanded?: boolean;
	/** id of the panel this trigger controls (2026 desktop dropdown a11y). */
	ariaControls?: string;
}

export interface ClickableItemProps extends MenuItemProps {
	titleValue: string;
	urlValue: string;
	type: string;
	typeClassName?: string;
	target?: string;
	tabIndex?: number;
	/** Reading-order position, published as `--stagger-index` for the dropdown slide-in. */
	index?: number;
	/** Stable label for click tracking when the visible content includes badges. */
	trackingText?: string;
	/** Fires when the pointer enters the item's `<li>` (2026 nav hover tracking). */
	onItemMouseEnter?: () => void;
	/** Fires when the item's link gains keyboard focus (2026 nav dropdown dismissal parity). */
	onItemFocus?: () => void;
}
