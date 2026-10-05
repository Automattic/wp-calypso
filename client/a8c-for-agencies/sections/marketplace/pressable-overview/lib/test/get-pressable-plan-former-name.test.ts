import {
	PRESSABLE_PLAN_RENAME_NOTE_END_DATE,
	getPressablePlanFormerName,
	getPressablePlanRenameNote,
} from '../get-pressable-plan-former-name';

describe( 'getPressablePlanFormerName', () => {
	it( 'names every renamed Signature and Premium plan', () => {
		for ( let tier = 1; tier <= 17; tier++ ) {
			expect( getPressablePlanFormerName( `pressable-signature-${ tier }` ) ).toBe(
				`Pressable Signature ${ tier }`
			);
		}
		for ( let tier = 1; tier <= 11; tier++ ) {
			expect( getPressablePlanFormerName( `pressable-premium-${ tier }` ) ).toBe(
				`Pressable Premium ${ tier }`
			);
		}
	} );

	it( 'ignores plans that were not renamed', () => {
		expect( getPressablePlanFormerName( 'pressable-premium' ) ).toBeUndefined();
		expect( getPressablePlanFormerName( 'pressable-wp-1' ) ).toBeUndefined();
		expect( getPressablePlanFormerName( 'pressable-enterprise-1' ) ).toBeUndefined();
		expect( getPressablePlanFormerName( 'pressable-signature-18' ) ).toBeUndefined();
		expect( getPressablePlanFormerName( 'pressable-premium-12' ) ).toBeUndefined();
	} );
} );

describe( 'getPressablePlanRenameNote', () => {
	const beforeEnd = new Date( '2026-10-08T00:00:00Z' );

	it( 'explains a renamed plan once the API returns the new name', () => {
		expect(
			getPressablePlanRenameNote(
				{ slug: 'pressable-signature-2', name: 'Pressable Standard 3' },
				beforeEnd
			)
		).toBe( 'Pressable Signature 2' );
	} );

	it( 'says nothing while the API still returns the old name', () => {
		expect(
			getPressablePlanRenameNote(
				{ slug: 'pressable-signature-2', name: 'Pressable Signature 2' },
				beforeEnd
			)
		).toBeUndefined();
	} );

	it( 'says nothing for a legacy plan', () => {
		expect(
			getPressablePlanRenameNote(
				{ slug: 'pressable-premium', name: 'Pressable Premium' },
				beforeEnd
			)
		).toBeUndefined();
	} );

	it( 'says nothing after the note expires', () => {
		expect(
			getPressablePlanRenameNote(
				{ slug: 'pressable-signature-2', name: 'Pressable Standard 3' },
				PRESSABLE_PLAN_RENAME_NOTE_END_DATE
			)
		).toBeUndefined();
	} );
} );
