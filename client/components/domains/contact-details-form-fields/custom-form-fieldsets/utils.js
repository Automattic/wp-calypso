/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export const STATE_LABEL = {
	CA: translate( 'Province' ),
};
export const STATE_SELECT_TEXT = {
	CA: translate( 'Select Province' ),
};
export const POST_CODE_LABEL = {
	US: translate( 'ZIP code' ),
};

export function getStateLabelText( countryCode ) {
	return STATE_LABEL[ countryCode ] || translate( 'State' );
}

export function getPostCodeLabelText( countryCode ) {
	return POST_CODE_LABEL[ countryCode ] || translate( 'Postal Code' );
}
