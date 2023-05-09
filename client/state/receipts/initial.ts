import type { ReceiptState } from './types';

export const initialReceiptState: ReceiptState = {
	data: null,
	error: null,
	hasLoadedFromServer: false,
	isRequesting: false,
};
