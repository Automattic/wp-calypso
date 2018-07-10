/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostSavedState } from '../';

describe( 'PostSavedState', () => {
	it( 'should display saving while save in progress, even if not saveable', () => {
		const wrapper = shallow(
			<PostSavedState
				isNew
				isDirty={ false }
				isSaving={ true }
				isSaveable={ false } />
		);

		expect( wrapper.text() ).toContain( 'Saving' );
	} );

	it( 'returns null if the post is not saveable', () => {
		const wrapper = shallow(
			<PostSavedState
				isNew
				isDirty={ false }
				isSaving={ false }
				isSaveable={ false } />
		);

		expect( wrapper.type() ).toBeNull();
	} );

	it( 'returns a switch to draft link if the post is published', () => {
		const wrapper = shallow( <PostSavedState isPublished /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	it( 'should return Saved text if not new and not dirty', () => {
		const wrapper = shallow(
			<PostSavedState
				isNew={ false }
				isDirty={ false }
				isSaving={ false }
				isSaveable={ true } />
		);

		expect( wrapper.childAt( 0 ).name() ).toBe( 'Dashicon' );
		expect( wrapper.childAt( 1 ).text() ).toBe( 'Saved' );
	} );

	it( 'should return Save button if edits to be saved', () => {
		const saveSpy = jest.fn();
		const wrapper = shallow(
			<PostSavedState
				isNew={ false }
				isDirty={ true }
				isSaving={ false }
				isSaveable={ true }
				onSave={ saveSpy } />
		);

		expect( wrapper.name() ).toBe( 'IconButton' );
		wrapper.simulate( 'click' );
		expect( saveSpy ).toHaveBeenCalled();
	} );
} );
