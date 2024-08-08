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
}

export interface ClickableItemProps extends MenuItemProps {
	titleValue: string;
	urlValue: string;
	type: string;
	typeClassName?: string;
	target?: string;
}

export type LanguageOptions = Record< string, string >;
