import { createDefaultLeadMatchingDetails } from '../../utils/map-application-form-data';
import { validateLeadMatchingDetails } from '../hooks/use-lead-matching-form-validation';

describe( 'validateLeadMatchingDetails', () => {
	it( 'requires the reference form required fields', () => {
		const details = createDefaultLeadMatchingDetails();

		expect( validateLeadMatchingDetails( details ) ).toMatchObject( {
			regions: 'Please select at least one region',
			languages: 'Please select at least one language',
			businessTypes: 'Please select at least one business type',
			idealBusinessTypes: 'Please select at least one ideal business type',
			companySizes: 'Please select at least one company size',
			projectTypes: 'Please select at least one project type',
			budgetLevels: 'Please select at least one budget level',
			serviceLevels: 'Please select at least one service level',
			timingPreferences: 'Please select at least one timing preference',
			decisionProcesses: 'Please select at least one decision process',
			ongoingRelationships: 'Please select at least one relationship type',
		} );
	} );

	it( 'passes for a valid lead matching details object', () => {
		const details = createDefaultLeadMatchingDetails();
		details.regions = [ 'americas' ];
		details.languages = [ 'en' ];
		details.businessTypes = [ 'local_service' ];
		details.idealBusinessTypes = [ 'content_media' ];
		details.companySizes = [ 'size_1_5' ];
		details.projectTypes = [ 'migration' ];
		details.serviceLevels = [ 'essential' ];
		details.budgetLevels = [ 'affordable' ];
		details.timingPreferences = [ 'right_away' ];
		details.decisionProcesses = [ 'individual' ];
		details.ongoingRelationships = [ 'care_plans' ];

		expect( validateLeadMatchingDetails( details ) ).toBeNull();
	} );
} );
