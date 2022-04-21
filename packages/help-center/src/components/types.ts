import { ReactElement } from 'react';

export interface Container {
	content: ReactElement;
	handleClose: () => void;
	headerText: string;
}

export interface Content {
	content: ReactElement;
}

export interface Header {
	isMinimized?: boolean;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onDismiss: () => void;
	headerText: string;
}
