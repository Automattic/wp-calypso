import { TranslateResult } from 'i18n-calypso';

export interface Props {
	header: string;
	navItems: FoldableNavItem[];
	expandedInit?: boolean;
	compact?: boolean;
	tracksName?: string;
}

export interface FoldableNavItem {
	icon?: JSX.Element;
	link: string;
	slug: string;
	title: TranslateResult;
	trackEventName: string;
	isExternalLink?: boolean;
}
