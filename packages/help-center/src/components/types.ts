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
