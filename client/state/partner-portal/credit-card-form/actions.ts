import { UnknownAction } from 'redux';

export function setCardDataError( type: string, message: string | null ): UnknownAction {
	return { type: 'CARD_DATA_ERROR_SET', payload: { type, message } };
}

export function setCardDataComplete( type: string, complete: boolean ): UnknownAction {
	return { type: 'CARD_DATA_COMPLETE_SET', payload: { type, complete } };
}

export function setUseAsPrimaryPaymentMethod( payload: boolean ) {
	return { type: 'USE_AS_PRIMARY_PAYMENT_METHOD', payload };
}

export function setFieldValue( key: string, value: string ): UnknownAction {
	return { type: 'FIELD_VALUE_SET', payload: { key, value } };
}

export function setFieldError( key: string, message: string ): UnknownAction {
	return { type: 'FIELD_ERROR_SET', payload: { key, message } };
}

export function touchAllFields(): UnknownAction {
	return { type: 'TOUCH_ALL_FIELDS' };
}
