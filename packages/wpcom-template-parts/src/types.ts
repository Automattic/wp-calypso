import type useAutomatticBrandingNoun from './hooks/use-automattic-branding-noun';
import type { useLocalizeUrl } from '@automattic/i18n-utils';

export interface HeaderProps {
	isLoggedIn: boolean;
	sectionName?: string;
	logoColor?: string;
	variant?: 'default' | 'minimal';
}

export interface FooterProps {
	onLanguageChange?: React.ChangeEventHandler< HTMLSelectElement >;
	isLoggedIn?: boolean;
	currentRoute?: string;
	additionalCompanyLinks?: React.ReactChild | null;
}
export interface PureFooterProps extends FooterProps {
	localizeUrl?: ReturnType< typeof useLocalizeUrl >;
	locale?: string;
	isEnglishLocale?: boolean;
	automatticBranding?: ReturnType< typeof useAutomatticBrandingNoun >;
	languageOptions?: LanguageOptions;
}

export interface MenuItemProps {
	content: string;
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
