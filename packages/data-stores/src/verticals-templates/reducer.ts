/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Template } from './types';
import { Action } from './actions';
import { getVerticalTemplateKey } from './utils';

const templates: Reducer< Record< string, Template[] | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_TEMPLATES' ) {
		return {
			...state,
			[ action.verticalId ]: action.templates,
		};
	}
	return state;
};

const verticalTemplates: Reducer< Record< string, Template | undefined >, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_VERTICAL_TEMPLATE' ) {
		return {
			...state,
			[ getVerticalTemplateKey( action.verticalId, action.templateSlug ) ]: action.template,
		};
	}
	return state;
};

const reducer = combineReducers( { templates, verticalTemplates } );

export type State = ReturnType< typeof reducer >;

export default reducer;
