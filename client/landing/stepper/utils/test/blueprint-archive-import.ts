import { getStandaloneBlueprintArchiveSlug } from '../blueprint-archive-import';

describe( 'getStandaloneBlueprintArchiveSlug', () => {
	it( 'returns the Blueprint archive slug when there is no Playground ID', () => {
		expect( getStandaloneBlueprintArchiveSlug( 'coaching-1', null ) ).toBe( 'coaching-1' );
	} );

	it( 'ignores the retained Blueprint value after a Playground ID exists', () => {
		expect( getStandaloneBlueprintArchiveSlug( '945', 'playground-uuid' ) ).toBeNull();
	} );
} );
