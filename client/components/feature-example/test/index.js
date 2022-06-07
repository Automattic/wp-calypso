import { shallow } from 'enzyme';
import FeatureExample from '../index';

describe( 'Feature Example', () => {
	test( 'should have Feature-example class', () => {
		const featureExample = shallow( <FeatureExample /> );
		expect( featureExample.find( '.feature-example' ).length ).toBe( 1 );
	} );

	test( 'should contains the passed children wrapped by a feature-example div', () => {
		const featureExample = shallow(
			<FeatureExample>
				<div>test</div>
			</FeatureExample>
		);
		expect( featureExample.contains( <div>test</div> ) ).toBe( true );
	} );
} );
