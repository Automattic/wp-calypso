import { Threat } from '../types';
import { getThreatSignatureComponents } from '../utils';

describe( 'getThreatSignatureComponents', () => {
	test( 'parses signature names containing a signature ID', () => {
		expect(
			getThreatSignatureComponents( {
				signature: '(123)php_generic_backdoor_001',
			} as Threat )
		).toMatchObject( {
			signatureId: '123',
			language: 'php',
			payload: 'generic',
			family: 'backdoor',
			variant: '001',
		} );
	} );

	test( 'parses signature names without a signature ID', () => {
		expect(
			getThreatSignatureComponents( {
				signature: 'php_generic_backdoor_001',
			} as Threat )
		).toMatchObject( {
			signatureId: undefined,
			language: 'php',
			payload: 'generic',
			family: 'backdoor',
			variant: '001',
		} );
	} );

	test( 'parses signature names containing a family value that includes underscores', () => {
		expect(
			getThreatSignatureComponents( {
				signature: '(123)php_generic_obfuscated_fopo_001',
			} as Threat )
		).toMatchObject( {
			signatureId: '123',
			language: 'php',
			payload: 'generic',
			family: 'obfuscated_fopo',
			variant: '001',
		} );

		expect(
			getThreatSignatureComponents( {
				signature: '(123)php_generic_foo_bar_baz_001',
			} as Threat )
		).toMatchObject( {
			signatureId: '123',
			language: 'php',
			payload: 'generic',
			family: 'foo_bar_baz',
			variant: '001',
		} );
	} );

	test( 'returns null when the provided signature cannot be parsed', () => {
		expect(
			getThreatSignatureComponents( {
				signature: '(123)php_generic_001',
			} as Threat )
		).toBe( null );
	} );
} );
