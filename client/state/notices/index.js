import store from 'state';
import { newNotice } from './actions';

export function success( text, options ) {
    return store.dispatch( newNotice( 'is-success', text, options ) );
}

export function error( text, options ) {
    return store.dispatch( newNotice( 'is-error', text, options ) );
}
