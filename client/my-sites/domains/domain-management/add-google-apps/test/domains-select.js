/** @format */
/**
 * External dependencies
 */
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import DomainsSelect from '../domains-select';

const noop = () => {};

describe( 'DomainSelect', () => {
	test( 'it renders DomainsSelect with one domain correctly', () => {
		const tree = renderer
			.create(
				<DomainsSelect
					domains={ [ { name: 'foo' } ] }
					isRequestingSiteDomains={ false }
					onChange={ noop }
					onFocus={ noop }
					translate={ noop }
					value="foo"
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders DomainsSelect with two domains correctly', () => {
		const tree = renderer
			.create(
				<DomainsSelect
					domains={ [ { name: 'foo' }, { name: 'bar' } ] }
					isRequestingSiteDomains={ false }
					onChange={ noop }
					onFocus={ noop }
					translate={ noop }
					value="foo"
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it renders DomainsSelect loading state correctly', () => {
		const tree = renderer
			.create(
				<DomainsSelect
					domains={ [] }
					isRequestingSiteDomains
					onChange={ noop }
					onFocus={ noop }
					translate={ noop }
					value="foo"
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'it should call onChange function when select changes', done => {
		const callback = jest.fn( () => {
			done();
		} );
		const instance = renderer.create(
			<DomainsSelect
				domains={ [ { name: 'foo' } ] }
				isRequestingSiteDomains={ false }
				onChange={ callback }
				onFocus={ noop }
				translate={ noop }
				value="foo"
			/>
		);
		const select = instance.root.find( el => el.type === 'select' );
		// trigger the onChange event for the select box
		select.props.onChange( 'buzz' );
		expect( callback ).toHaveBeenCalledWith( 'buzz' );
	} );

	test( 'it should call onFocus function when select is focused', done => {
		const callback = jest.fn( () => {
			done();
		} );
		const instance = renderer.create(
			<DomainsSelect
				domains={ [ { name: 'foo' } ] }
				isRequestingSiteDomains={ false }
				onChange={ noop }
				onFocus={ callback }
				translate={ noop }
				value="foo"
			/>
		);
		const select = instance.root.find( el => el.type === 'select' );
		// trigger the onFocus event for the select box
		select.props.onFocus( 'buzz' );
		expect( callback ).toHaveBeenCalledWith( 'buzz' );
	} );
} );
