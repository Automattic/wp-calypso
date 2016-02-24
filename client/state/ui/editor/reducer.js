/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import media from './media/reducer';
import contactForm from './contact-form/reducer';
import post from './post/reducer';

export default combineReducers( {
	media,
	contactForm,
	post
} );
