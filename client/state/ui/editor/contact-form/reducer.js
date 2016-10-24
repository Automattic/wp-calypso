/**
 * External dependencies
 */
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	EDITOR_CONTACT_FORM_CLEAR,
	EDITOR_CONTACT_FORM_LOAD,
	EDITOR_CONTACT_FORM_FIELD_ADD,
	EDITOR_CONTACT_FORM_FIELD_REMOVE,
	EDITOR_CONTACT_FORM_FIELD_UPDATE,
	EDITOR_CONTACT_FORM_SETTINGS_UPDATE
} from 'state/action-types';
import { CONTACT_FORM_DEFAULT, CONTACT_FORM_DEFAULT_NEW_FIELD } from './constants';

const initialState = cloneDeep( CONTACT_FORM_DEFAULT );

export default function( state = initialState, action ) {
	const { index, field, settings } = action;

	switch ( action.type ) {
		case EDITOR_CONTACT_FORM_CLEAR:
			state = cloneDeep( CONTACT_FORM_DEFAULT );
			break;
		case EDITOR_CONTACT_FORM_LOAD:
			state = cloneDeep( action.contactForm );
			break;
		case EDITOR_CONTACT_FORM_FIELD_ADD:
			state = Object.assign( {}, state, {
				fields: [ ...state.fields, CONTACT_FORM_DEFAULT_NEW_FIELD ]
			} );
			break;
		case EDITOR_CONTACT_FORM_FIELD_REMOVE: {
			state = cloneDeep( state );
			state.fields.splice( index, 1 );
			break;
		}
		case EDITOR_CONTACT_FORM_FIELD_UPDATE:
			state = cloneDeep( state );
			state.fields[ index ] = Object.assign( {}, state.fields[ index ], field );

			const newField = state.fields[ index ];

			if ( newField.type !== 'radio' && newField.type !== 'select' ) {
				delete newField.options;
			} else if ( newField.options === undefined ) {
				newField.options = i18n.translate( 'Option One,Option Two', {
					comment: 'Default options for drop down lists and radio buttons. Must be separated by a comma without extra spaces.'
				} );
			}

			break;
		case EDITOR_CONTACT_FORM_SETTINGS_UPDATE:
			state = merge( {}, state, settings );
			break;
	}

	return state;
}
