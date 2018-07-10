/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostLastRevisionCheck } from '../check';

describe( 'PostLastRevisionCheck', () => {
	it( 'should not render anything if the last revision ID is unknown', () => {
		const wrapper = shallow(
			<PostLastRevisionCheck revisionsCount={ 2 }>
				Children
			</PostLastRevisionCheck>
		);

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if there is only one revision', () => {
		const wrapper = shallow(
			<PostLastRevisionCheck lastRevisionId={ 1 } revisionsCount={ 1 }>
				Children
			</PostLastRevisionCheck>
		);

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should render if there are two revisions', () => {
		const wrapper = shallow(
			<PostLastRevisionCheck lastRevisionId={ 1 } revisionsCount={ 2 }>
				Children
			</PostLastRevisionCheck>
		);

		expect( wrapper.text() ).not.toBe( null );
	} );
} );
