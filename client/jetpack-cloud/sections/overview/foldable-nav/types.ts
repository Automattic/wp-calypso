import { TranslateResult } from 'i18n-calypso';

export interface Props {
	header: string;
	navItems: FoldableNavItem[];
	expandedInit?: boolean;
	compact?: boolean;
	preferenceName: string;
	tracksName?: string;
}

export interface FoldableNavItem {
	icon?: JSX.Element;
	link: string;
	title: TranslateResult;
	trackEventName: string;
}
