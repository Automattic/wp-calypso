import { getEmptyLeadMatchingFormData, type LeadMatchingFormData } from '../form-data';
import { getLeadMatchingStatus, isSectionAnswered } from '../sections';

const complete: LeadMatchingFormData = {
	...getEmptyLeadMatchingFormData(),
	regions: [ 'emea' ],
	languages: [ 'en' ],
	businessTypes: [ 'local_service' ],
	idealBusinessTypes: [ 'content_media' ],
	companySizes: [ 'size_1_5' ],
	projectTypes: [ 'new_website' ],
	serviceLevels: [ 'enhanced' ],
	budgetLevels: [ 'mid_range' ],
	timingPreferences: [ 'flexible' ],
	decisionProcesses: [ 'individual' ],
	ongoingRelationships: [ 'training' ],
};

describe( 'lead matching sections', () => {
	test( 'status follows availability first, then the answers', () => {
		const empty = getEmptyLeadMatchingFormData();

		expect( getLeadMatchingStatus( complete, false ) ).toBe( 'not-accepting' );
		expect( getLeadMatchingStatus( empty, true ) ).toBe( 'not-started' );
		expect( getLeadMatchingStatus( { ...complete, languages: [] }, true ) ).toBe( 'in-progress' );
		expect( getLeadMatchingStatus( complete, true ) ).toBe( 'eligible' );
	} );

	test( 'a section is answered once all its required questions are', () => {
		expect( isSectionAnswered( 'regions-and-languages', complete ) ).toBe( true );
		expect( isSectionAnswered( 'regions-and-languages', { ...complete, languages: [] } ) ).toBe(
			false
		);
	} );

	test( 'availability always counts as answered', () => {
		expect( isSectionAnswered( 'availability', getEmptyLeadMatchingFormData() ) ).toBe( true );
	} );

	test( 'the optional hosting section is answered by any answer', () => {
		expect( isSectionAnswered( 'hosting-and-platforms', complete ) ).toBe( false );
		expect(
			isSectionAnswered( 'hosting-and-platforms', { ...complete, migrationPlatforms: [ 'wix' ] } )
		).toBe( true );
	} );
} );
