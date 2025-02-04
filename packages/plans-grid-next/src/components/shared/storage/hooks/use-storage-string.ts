import { useTranslate } from 'i18n-calypso';

function useStorageString( quantity: number ) {
	const translate = useTranslate();

	return translate( '%(quantity)d GB', {
		args: {
			quantity,
		},
	} );
}

export default useStorageString;
