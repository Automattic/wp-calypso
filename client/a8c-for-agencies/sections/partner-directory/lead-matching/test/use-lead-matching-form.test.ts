/**
 * @jest-environment jsdom
 */

import { createDefaultLeadMatchingDetails } from '../../utils/map-application-form-data';
import { shouldHydrateLeadMatchingDraft } from '../hooks/use-lead-matching-form';

describe( 'useLeadMatchingForm', () => {
	it( 'hydrates the draft when no draft exists yet', () => {
		expect( shouldHydrateLeadMatchingDraft( undefined, null ) ).toBe( true );
	} );

	it( 'hydrates the draft when it still matches the previous persisted form state', () => {
		const previousInitialData = createDefaultLeadMatchingDetails();

		expect( shouldHydrateLeadMatchingDraft( previousInitialData, previousInitialData ) ).toBe(
			true
		);
	} );

	it( 'preserves unsaved draft edits when fresh persisted data arrives', () => {
		const previousInitialData = createDefaultLeadMatchingDetails();
		const draftFormData = {
			...previousInitialData,
			regions: [ 'americas' ],
		};

		expect( shouldHydrateLeadMatchingDraft( draftFormData, previousInitialData ) ).toBe( false );
	} );
} );
