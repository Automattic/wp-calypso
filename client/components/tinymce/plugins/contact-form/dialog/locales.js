/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

const labels = {
	name() {
		return translate( 'Name' );
	},
	email() {
		return translate( 'Email Address' );
	},
	checkbox() {
		return translate( 'Checkbox' );
	},
	select() {
		return translate( 'Dropdown' );
	},
	radio() {
		return translate( 'Radio Button' );
	},
	text() {
		return translate( 'Text' );
	},
	textarea() {
		return translate( 'Text Area' );
	},
	url() {
		return translate( 'Web Address' );
	},
};

export default function( type ) {
	return labels.hasOwnProperty( type ) ? labels[ type ].call() : null;
}
