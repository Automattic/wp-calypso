import { ReactElement } from 'react';

export interface Container {
	content: ReactElement;
	handleClose: () => void;
}

export interface Content {
	content: ReactElement;
}

export interface Header {
	isMinimized?: boolean;
	onMinimize?: () => void;
	onMaximize?: () => void;
	onDismiss: () => void;
}
