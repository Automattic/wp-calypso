export default function useI18n() {
	before( () => {
		require( 'lib/mixins/i18n' ).initialize( { '': {} } );
	} );
}
