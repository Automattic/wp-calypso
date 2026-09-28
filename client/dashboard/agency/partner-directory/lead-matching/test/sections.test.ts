import { getEmptyLeadMatchingFormData, type LeadMatchingFormData } from '../form-data';
import {
	getLeadMatchingStatus,
	getNextSectionToAnswer,
	isSectionAnswered,
	validateLeadMatchingSection,
} from '../sections';

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
			isSectionAnswered(
				'hosting-and-platforms',
				{ ...complete, migrationPlatforms: [ 'wix' ] },
				true
			)
		).toBe( true );
	} );

	test( 'the next section skips answered and optional sections', () => {
		expect( getNextSectionToAnswer( getEmptyLeadMatchingFormData() ) ).toBe(
			'regions-and-languages'
		);
		expect( getNextSectionToAnswer( { ...complete, projectTypes: [] } ) ).toBe( 'website-needs' );
		expect( getNextSectionToAnswer( complete ) ).toBeUndefined();
	} );

	test( 'validates only the section’s required questions', () => {
		expect(
			validateLeadMatchingSection( 'website-needs', getEmptyLeadMatchingFormData() )
		).toEqual( {
			projectTypes: 'Please select at least one project type',
			serviceLevels: 'Please select at least one service level',
		} );
		expect(
			validateLeadMatchingSection( 'hosting-and-platforms', getEmptyLeadMatchingFormData() )
		).toEqual( {} );
	} );
} );
