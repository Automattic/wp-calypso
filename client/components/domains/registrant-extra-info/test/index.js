/**
 * External Dependencies
 */
import { expect } from 'chai';
import { assign, orderBy } from 'lodash';

/**
 * Internal Dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';
import EmptyComponent from 'test/helpers/react/empty-component';
import ExtraInfoFrForm from 'components/domains/registrant-extra-info/fr-form';

describe( 'Domain Suggestion', function() {
	useFakeDom();
	useMockery( ( mockery ) => {
		mockery.registerMock( 'components/forms/form-button', EmptyComponent );
	} );

	describe( 'getRelevantFields', () => {
		const exampleState = {
			countryOfBirth: 'FR',
			dateOfBirth: '2000-12-31',
			placeOfBirth: 'dummyCity',
			postalCodeOfBirth: '12345',
			registrantType: 'individual',
			registrantVatId: 'XX123456789',
			sirenSiret: '123456789',
			trademarkNumber: '123456789',
		};

		it( 'chooses correct attributes for individual born in France', () => {
			const expectedFields = [ 'countryOfBirth', 'dateOfBirth', 'placeOfBirth', 'postalCodeOfBirth', 'registrantType' ];
			const formObject = new ExtraInfoFrForm();
			expect( orderBy( formObject.getRelevantFields( exampleState ) ) )
				.to.eql( expectedFields );
		} );

		it( 'chooses correct attributes for individual born elsewhere', () => {
			const expectedFields = [ 'countryOfBirth', 'dateOfBirth', 'registrantType' ];
			const formObject = new ExtraInfoFrForm();
			const testState = assign( {}, exampleState, { countryOfBirth: 'AU' } );

			expect( orderBy( formObject.getRelevantFields( testState ) ) )
				.to.eql( expectedFields );
		} );

		it( 'chooses correct attributes for organizations', () => {
			const expectedFields = [ 'registrantType', 'registrantVatId', 'sirenSiret', 'trademarkNumber' ];
			const formObject = new ExtraInfoFrForm();
			const testState = assign( {}, exampleState, { registrantType: 'organization' } );

			expect( orderBy( formObject.getRelevantFields( testState ) ) )
				.to.eql( expectedFields );
		} );
	} );
} );
