import {
	PANDANCE_SELECTED_TOGGLE,
	PANDANCE_BUSINESS_NAME_ENTER,
	PANDANCE_BUSINESS_DESCRIPTION_ENTER,
} from 'state/action-types';

export function toggleBlock( id ) {
	return {
		type: PANDANCE_SELECTED_TOGGLE,
		id,
	}
}

export function enterBusinessName( name ) {
	return {
		type: PANDANCE_BUSINESS_NAME_ENTER,
		name,
	}
}

export function enterBusinessDescription( description ) {
	return {
		type: PANDANCE_BUSINESS_DESCRIPTION_ENTER,
		description,
	}
}
