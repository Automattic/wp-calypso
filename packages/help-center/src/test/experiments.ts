import {
	HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT,
	getHelpCenterExperimentVariations,
} from '../experiments';

const helpCenterNode = ( menuTitle?: string ) => ( {
	id: 'help-center',
	meta: { menu_title: menuTitle },
} );

describe( 'getHelpCenterExperimentVariations', () => {
	it( 'leaves the key out while the admin bar is unresolved', () => {
		expect( getHelpCenterExperimentVariations( undefined ) ).toBeUndefined();
	} );

	it( 'reads the treatment from the entry label', () => {
		expect( getHelpCenterExperimentVariations( [ helpCenterNode( 'Get Help' ) ] ) ).toEqual( {
			[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ]: 'treatment',
		} );
	} );

	it( 'reports no variation when the entry point carries no label', () => {
		expect( getHelpCenterExperimentVariations( [ helpCenterNode( '' ) ] ) ).toEqual( {
			[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ]: null,
		} );
	} );

	it( 'reports no variation when the payload has no help entry point', () => {
		expect( getHelpCenterExperimentVariations( [ { id: 'my-account' } ] ) ).toEqual( {
			[ HELP_CENTER_GET_HELP_CHAT_FORWARD_EXPERIMENT ]: null,
		} );
	} );
} );
