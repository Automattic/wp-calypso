/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { initializeDirectly } from './vendor';

const DEFAULT_RTM_WIDGET_OPTIONS = {
	id: config( 'directly_rtm_widget_id' ),
	displayAskQuestion: false
};

function DirectlyRTM( ...args ) {
	if ( ! window.DirectlyRTM ) {
		return;
	}
	return window.DirectlyRTM( ...args );
}

export function initialize( directlyConfig = {} ) {
	initializeDirectly( { ...DEFAULT_RTM_WIDGET_OPTIONS, ...directlyConfig } );
}

export function askQuestion( questionText, name, email ) {
	DirectlyRTM( 'askQuestion', { questionText, name, email } );
}

export function maximize() {
	DirectlyRTM( 'maximize' );
}

export function minimize() {
	DirectlyRTM( 'minimize' );
}

export function openAskForm() {
	DirectlyRTM( 'openAskForm' );
}
