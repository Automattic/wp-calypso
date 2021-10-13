import { expect } from 'chai';
import { render } from 'enzyme';
import FollowButton from '../button';

describe( 'FollowButton', () => {
	test( 'should apply a custom follow label', () => {
		const wrapper = render( <FollowButton followLabel="Follow Tag" /> );
		expect( wrapper.text() ).to.contain( 'Follow Tag' );
	} );
} );
