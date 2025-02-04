import { serialize, deserialize } from 'calypso/state/utils';
import { StagingSiteStatus } from '../constants';
import persistentReducer from '../reducer';

describe( 'state', () => {
	describe( 'staging-site', () => {
		describe( 'reducer', () => {
			test( 'should persist all state keys', () => {
				const SITE_ID = 12345;
				const AT_STATE = {
					[ SITE_ID ]: {
						status: StagingSiteStatus.COMPLETE,
					},
				};

				const serialized = serialize( persistentReducer, AT_STATE ).root();
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'status' );

				const deserialized = deserialize( persistentReducer, AT_STATE );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'status', StagingSiteStatus.COMPLETE );
			} );
		} );
	} );
} );
