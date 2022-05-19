import { shallow } from 'enzyme';
import RegistrantExtraInfoCaForm from '../ca-form';
import RegistrantExtraInfoFrForm from '../fr-form';
import RegistrantExtraInfoForm from '../index';
import RegistrantExtraInfoUkForm from '../uk-form';

describe( 'Switcher Form', () => {
	test( 'should render correct form for fr', () => {
		const wrapper = shallow( <RegistrantExtraInfoForm tld="fr" /> );

		expect( wrapper.find( RegistrantExtraInfoFrForm ) ).toHaveLength( 1 );
		expect( wrapper.find( RegistrantExtraInfoCaForm ) ).toHaveLength( 0 );
	} );

	test( 'should render correct form for ca', () => {
		const wrapper = shallow( <RegistrantExtraInfoForm tld="ca" /> );

		expect( wrapper.find( RegistrantExtraInfoCaForm ) ).toHaveLength( 1 );
		expect( wrapper.find( RegistrantExtraInfoFrForm ) ).toHaveLength( 0 );
	} );

	test( 'should render correct form for uk', () => {
		const wrapper = shallow( <RegistrantExtraInfoForm tld="uk" /> );

		expect( wrapper.find( RegistrantExtraInfoCaForm ) ).toHaveLength( 0 );
		expect( wrapper.find( RegistrantExtraInfoFrForm ) ).toHaveLength( 0 );
		expect( wrapper.find( RegistrantExtraInfoUkForm ) ).toHaveLength( 1 );
	} );
} );
