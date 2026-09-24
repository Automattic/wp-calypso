import { addNewPaymentMethod } from './paths';

export function isDataLoading( props: {
	hasLoadedSites: boolean;
	hasLoadedUserPurchasesFromServer: boolean;
} ): boolean {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

export function getAddNewPaymentMethodPath(): string {
	return addNewPaymentMethod;
}

export function getCancelPurchaseSurveyCompletedPreferenceKey(
	purchaseId: string | number
): string {
	return `cancel-purchase-survey-completed-${ purchaseId }`;
}
