import { translate } from 'i18n-calypso';

export const STATE_LABEL: Record< string, string > = {
	CA: translate( 'Province' ),
};
export const STATE_SELECT_TEXT: Record< string, string > = {
	CA: translate( 'Select Province' ),
};
export const POST_CODE_LABEL: Record< string, string > = {
	US: translate( 'ZIP code' ),
};

export function getStateLabelText( countryCode: string ) {
	return STATE_LABEL[ countryCode ] || translate( 'State' );
}

export function getPostCodeLabelText( countryCode: string ) {
	return POST_CODE_LABEL[ countryCode ] || translate( 'Postal Code' );
}
