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
	/** Opt into the 2026 Global Nav redesign (logged-out surfaces). */
	nav2026?: boolean;
	/** Which 2026 taxonomy to render: 1 (Websites/Hosting/Domains/…) or 2 (Products/…). Defaults to 1. */
	nav2026Variant?: 1 | 2;
	/** Current user's avatar URL, used by the 2026 mobile menu footer when logged in. */
	userAvatar?: string;
	/** Current user's display name, used by the 2026 mobile menu footer when logged in. */
	userName?: string;
	/** Current user's email, used by the 2026 mobile menu footer when logged in. */
	userEmail?: string;
}

export interface FooterProps {
	onLanguageChange?: React.ChangeEventHandler< HTMLSelectElement >;
	isLoggedIn?: boolean;
	currentRoute?: string;
	additionalCompanyLinks?: React.ReactNode;
}
export interface PureFooterProps extends FooterProps {
	localizeUrl?: ReturnType< typeof useLocalizeUrl >;
	locale?: string;
	isEnglishLocale?: boolean;
	automatticBranding?: ReturnType< typeof getAutomatticBrandingNoun >;
	languageOptions?: LanguageOptions;
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
	/** Fires when the pointer enters the item's `<li>` (2026 nav hover tracking). */
	onItemMouseEnter?: () => void;
	/** Fires when the item's link gains keyboard focus (2026 nav dropdown dismissal parity). */
	onItemFocus?: () => void;
}

export type LanguageOptions = Record< string, string >;
