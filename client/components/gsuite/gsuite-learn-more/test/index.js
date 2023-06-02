import renderer from 'react-test-renderer';
import GSuiteLearnMore from '../';

describe( 'GSuiteLearnMore', () => {
	test( 'it renders GSuiteLearnMore with no props', () => {
		const tree = renderer.create( <GSuiteLearnMore /> ).toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
