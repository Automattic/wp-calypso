import { selectDesignCategory, submitDIFMLiteForm } from '../actions';
import reducer, { defaultValue } from '../reducer';

describe( 'difm-lite data reducers', () => {
	test( 'Default should return the existing state', () => {
		expect( reducer( undefined, {} ) ).toEqual( defaultValue );
	} );

	test( 'When selecting a design  the category should be set', () => {
		const selectDesignAction = selectDesignCategory( 'professional-services ' );
		expect( reducer( defaultValue, selectDesignAction ) ).toEqual( {
			selectedDIFMCategory: 'professional-services ',
			typeformResponseId: '',
		} );
	} );

	test( 'When a form is submitted the typeform response ID should be set', () => {
		const submitDIFMLiteFormAction = submitDIFMLiteForm( 'XXXXYYYYZZZZ' );

		expect( reducer( defaultValue, submitDIFMLiteFormAction ) ).toEqual( {
			selectedDIFMCategory: '',
			typeformResponseId: 'XXXXYYYYZZZZ',
		} );
	} );
} );
