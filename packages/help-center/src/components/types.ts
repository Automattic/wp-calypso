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

export interface SitePicker {
	selectedSiteId: number | undefined;
	onSetSelectedSiteId: React.Dispatch< React.SetStateAction< number | undefined > >;
	siteId?: number;
}
