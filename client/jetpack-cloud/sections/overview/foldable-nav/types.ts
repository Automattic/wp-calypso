import { TranslateResult } from 'i18n-calypso';

export interface Props {
	header: string;
	navItems: FoldableNavItem[];
}

export interface FoldableNavItem {
	icon?: JSX.Element;
	link: string;
	title: TranslateResult;
	trackEventName: string;
}
