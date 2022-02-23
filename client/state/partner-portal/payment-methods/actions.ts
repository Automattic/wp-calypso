import { AnyAction } from 'redux';

export function setCardDataError( type: string, message: string | null ): AnyAction {
	return { type: 'CARD_DATA_ERROR_SET', payload: { type, message } };
}

export function setCardDataComplete( type: string, complete: boolean ): AnyAction {
	return { type: 'CARD_DATA_COMPLETE_SET', payload: { type, complete } };
}

export function setUseAsPrimaryPaymentMethod( payload: boolean ) {
	return { type: 'USE_AS_PRIMARY_PAYMENT_METHOD', payload };
}

export function setFieldValue( key: string, value: string ): AnyAction {
	return { type: 'FIELD_VALUE_SET', payload: { key, value } };
}

export function setFieldError( key: string, message: string ): AnyAction {
	return { type: 'FIELD_ERROR_SET', payload: { key, message } };
}

export function touchAllFields(): AnyAction {
	return { type: 'TOUCH_ALL_FIELDS' };
}
