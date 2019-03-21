/** @format */
/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuiteUserItem from 'my-sites/email/email-management/gsuite-user-item';

const noop = () => {};

describe( 'GSuiteUserItem', () => {
	test( 'renders correctly', () => {
		const tree = renderer
			.create(
				<GSuiteUserItem onClick={ noop } user={ { email: 'foo@bar.buzz', domain: 'bar.buzz' } } />
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'should call onClick function when manage is clicked', done => {
		const callback = jest.fn( () => {
			done();
		} );
		const instance = renderer.create(
			<GSuiteUserItem onClick={ callback } user={ { email: 'foo@bar.buzz', domain: 'bar.buzz' } } />
		);
		const link = instance.root.findByProps( { className: 'gsuite-user-item__manage-link' } );
		// trigger the onClick
		link.props.onClick( 'buzz' );
		expect( callback ).toHaveBeenCalledWith( 'buzz' );
	} );
} );
