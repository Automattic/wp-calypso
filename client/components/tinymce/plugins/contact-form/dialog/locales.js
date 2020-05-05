import i18n from 'i18n-calypso';

const labels = {
	name() {
		return i18n.translate( 'Name' );
	},
	email() {
		return i18n.translate( 'Email Address' );
	},
	checkbox() {
		return i18n.translate( 'Checkbox' );
	},
	select() {
		return i18n.translate( 'Dropdown' );
	},
	radio() {
		return i18n.translate( 'Radio Button' );
	},
	text() {
		return i18n.translate( 'Text' );
	},
	textarea() {
		return i18n.translate( 'Text Area' );
	},
	url() {
		return i18n.translate( 'Web Address' );
	},
};

export default function ( type ) {
	return labels.hasOwnProperty( type ) ? labels[ type ].call() : null;
}
