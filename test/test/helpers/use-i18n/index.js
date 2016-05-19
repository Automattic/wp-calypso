export default function useI18n() {
	before( () => {
		require( 'i18n-calypso' ).configure();
	} );
}
