/**
 * External dependencies
 */
import { get } from 'lodash';

export const getShippingSettingsForm = ( state ) => {
	return get( state, [ 'form' ], null );
};

export const isLoaded = ( state ) => {
	const form = getShippingSettingsForm( state );
	return get( form, 'loaded' );
};

export const isFetching = ( state ) => {
	const form = getShippingSettingsForm( state );
	return get( form, 'isFetching', false );
};

export const isFetchError = ( state ) => {
	const form = getShippingSettingsForm( state );
	return get( form, 'fetchError', false );
};

export const getFormSchema = ( state ) => {
	const form = getShippingSettingsForm( state );
	return get( form, 'schema', null );
};

export const getStoreOptions = ( state ) => {
	const form = getShippingSettingsForm( state );
	return get( form, 'storeOptions', null );
};

export const getFormLayout = ( state ) => {
	const form = getShippingSettingsForm( state );
	return get( form, 'layout', null );
};
