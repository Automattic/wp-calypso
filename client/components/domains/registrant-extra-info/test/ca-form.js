import { shallow } from 'enzyme';
import { RegistrantExtraInfoCaForm } from '../ca-form';

const mockProps = {
	translate: ( string ) => string,
	updateContactDetailsCache: () => {},
	userWpcomLang: 'EN',
	getFieldProps: () => ( {} ),
};

describe( 'ca-form', () => {
	// eslint-disable-next-line jest/expect-expect
	test( 'should render without errors when extra is empty', () => {
		const testProps = {
			...mockProps,
			contactDetails: {},
			ccTldDetails: {},
		};

		shallow( <RegistrantExtraInfoCaForm { ...testProps } /> );
	} );
} );
