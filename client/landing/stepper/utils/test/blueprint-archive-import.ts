import { getStandaloneBlueprintArchiveSlug } from '../blueprint-archive-import';

describe( 'getStandaloneBlueprintArchiveSlug', () => {
	it( 'returns the Blueprint archive slug for a standalone build_dest=wow flow', () => {
		expect( getStandaloneBlueprintArchiveSlug( 'coaching-1', null, 'wow' ) ).toBe( 'coaching-1' );
	} );

	it( 'ignores Blueprint values without build_dest=wow', () => {
		expect( getStandaloneBlueprintArchiveSlug( '945', null, null ) ).toBeNull();
	} );

	it( 'ignores retained Blueprint values after a Playground ID exists', () => {
		expect( getStandaloneBlueprintArchiveSlug( '945', 'playground-uuid', null ) ).toBeNull();
		expect( getStandaloneBlueprintArchiveSlug( '945', 'playground-uuid', 'wow' ) ).toBeNull();
	} );
} );
