import { SiteDetails } from '@automattic/data-stores/dist/types/site';
import { ReactElement } from 'react';

export interface Container {
	content: ReactElement;
	handleClose: () => void;
	headerText?: string;
	footerContent?: ReactElement;
}

export interface Content {
	content: ReactElement;
	isMinimized: boolean;
}

export interface Header {
	isMinimized?: boolean;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onDismiss: () => void;
	headerText: string;
}

export interface SuccessScreenProps {
	onBack: () => void;
	forumTopicUrl?: string;
}

export interface SitePicker {
	currentSite: SiteDetails | undefined;
	onSelect: ( siteId: number | string ) => void;
	siteId: string | number | null | undefined;
}

// ended means the user closed the popup
export type WindowState = 'open' | 'closed' | 'blurred' | 'ended';
