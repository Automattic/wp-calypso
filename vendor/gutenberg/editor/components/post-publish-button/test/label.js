/**
 * Internal dependencies
 */
import { PublishButtonLabel } from '../label';

describe( 'PublishButtonLabel', () => {
	it( 'should show publishing if publishing in progress', () => {
		const label = PublishButtonLabel( { hasPublishAction: true, isPublishing: true } );
		expect( label ).toBe( 'Publishing…' );
	} );

	it( 'should show updating if published and saving in progress', () => {
		const label = PublishButtonLabel( { hasPublishAction: true, isPublished: true, isSaving: true } );
		expect( label ).toBe( 'Updating…' );
	} );

	it( 'should show scheduling if scheduled and saving in progress', () => {
		const label = PublishButtonLabel( { hasPublishAction: true, isBeingScheduled: true, isSaving: true } );
		expect( label ).toBe( 'Scheduling…' );
	} );

	it( 'should show publish if not published and saving in progress', () => {
		const label = PublishButtonLabel( { hasPublishAction: true, isPublished: false, isSaving: true } );
		expect( label ).toBe( 'Publish' );
	} );

	it( 'should show submit for review for contributor', () => {
		const label = PublishButtonLabel( { hasPublishAction: false } );
		expect( label ).toBe( 'Submit for Review' );
	} );

	it( 'should show update for already published', () => {
		const label = PublishButtonLabel( { hasPublishAction: true, isPublished: true } );
		expect( label ).toBe( 'Update' );
	} );

	it( 'should show schedule for scheduled', () => {
		const label = PublishButtonLabel( { hasPublishAction: true, isBeingScheduled: true } );
		expect( label ).toBe( 'Schedule' );
	} );

	it( 'should show publish otherwise', () => {
		const label = PublishButtonLabel( { hasPublishAction: true } );
		expect( label ).toBe( 'Publish' );
	} );
} );
