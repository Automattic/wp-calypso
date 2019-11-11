/**
 * External dependencies
 */
import { dispatch } from '@wordpress/data';
import '@wordpress/nux'; //ensure nux store loads

dispatch( 'core/nux' ).disableTips();
