/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PostPublishButton } from '../';

describe( 'PostPublishButton', () => {
	describe( 'disabled', () => {
		it( 'should be disabled if post is currently saving', () => {
			const wrapper = shallow(
				<PostPublishButton hasPublishAction={ true } isSaving />
			);

			expect( wrapper.prop( 'disabled' ) ).toBe( true );
		} );

		it( 'should be disabled if post is not publishable', () => {
			const wrapper = shallow(
				<PostPublishButton hasPublishAction={ true } isPublishable={ false } />
			);

			expect( wrapper.prop( 'disabled' ) ).toBe( true );
		} );

		it( 'should be disabled if post is not saveable', () => {
			const wrapper = shallow(
				<PostPublishButton hasPublishAction={ true } isSaveable={ false } />
			);

			expect( wrapper.prop( 'disabled' ) ).toBe( true );
		} );

		it( 'should be enabled otherwise', () => {
			const wrapper = shallow(
				<PostPublishButton hasPublishAction={ true } isPublishable isSaveable />
			);

			expect( wrapper.prop( 'disabled' ) ).toBe( false );
		} );
	} );

	describe( 'publish status', () => {
		it( 'should be pending for contributor', () => {
			const onStatusChange = jest.fn();
			const onSave = jest.fn();
			const wrapper = shallow(
				<PostPublishButton
					hasPublishAction={ false }
					onStatusChange={ onStatusChange }
					onSave={ onSave } />
			);

			wrapper.simulate( 'click' );

			expect( onStatusChange ).toHaveBeenCalledWith( 'pending' );
		} );

		it( 'should be future for scheduled post', () => {
			const onStatusChange = jest.fn();
			const onSave = jest.fn();
			const wrapper = shallow(
				<PostPublishButton
					hasPublishAction={ true }
					onStatusChange={ onStatusChange }
					onSave={ onSave }
					isBeingScheduled />
			);

			wrapper.simulate( 'click' );

			expect( onStatusChange ).toHaveBeenCalledWith( 'future' );
		} );

		it( 'should be private for private visibility', () => {
			const onStatusChange = jest.fn();
			const onSave = jest.fn();
			const wrapper = shallow(
				<PostPublishButton
					hasPublishAction={ true }
					onStatusChange={ onStatusChange }
					onSave={ onSave }
					visibility="private" />
			);

			wrapper.simulate( 'click' );

			expect( onStatusChange ).toHaveBeenCalledWith( 'private' );
		} );

		it( 'should be publish otherwise', () => {
			const onStatusChange = jest.fn();
			const onSave = jest.fn();
			const wrapper = shallow(
				<PostPublishButton
					hasPublishAction={ true }
					onStatusChange={ onStatusChange }
					onSave={ onSave } />
			);

			wrapper.simulate( 'click' );

			expect( onStatusChange ).toHaveBeenCalledWith( 'publish' );
		} );
	} );

	describe( 'click', () => {
		it( 'should save with status', () => {
			const onStatusChange = jest.fn();
			const onSave = jest.fn();
			const wrapper = shallow(
				<PostPublishButton
					hasPublishAction={ true }
					onStatusChange={ onStatusChange }
					onSave={ onSave } />
			);

			wrapper.simulate( 'click' );

			expect( onStatusChange ).toHaveBeenCalledWith( 'publish' );
			expect( onSave ).toHaveBeenCalled();
		} );
	} );

	it( 'should have save modifier class', () => {
		const wrapper = shallow(
			<PostPublishButton hasPublishAction={ true } isSaving />
		);

		expect( wrapper.find( 'Button' ).prop( 'isBusy' ) ).toBe( true );
	} );
} );
