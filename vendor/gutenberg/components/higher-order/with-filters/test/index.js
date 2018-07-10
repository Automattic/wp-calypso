/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import TestUtils from 'react-dom/test-utils';
import ReactDOM from 'react-dom';

/**
 * WordPress dependencies
 */
import { addFilter, removeAllFilters, removeFilter } from '@wordpress/hooks';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import withFilters from '..';

const assertExpectedHtml = ( wrapper, expectedHTML ) => {
	/* eslint-disable react/no-find-dom-node */
	const element = ReactDOM.findDOMNode( wrapper );
	/* eslint-enable react/no-find-dom-node */
	expect( element.outerHTML ).toBe( expectedHTML );
};

// this is needed because TestUtils does not accept a stateless component.
// anything run through a HOC ends up as a stateless component.
const getTestComponent = ( WrappedComponent ) => {
	class TestComponent extends Component {
		render() {
			return <WrappedComponent { ...this.props } />;
		}
	}
	return <TestComponent />;
};

describe( 'withFilters', () => {
	let shallowWrapper, wrapper;

	const hookName = 'EnhancedComponent';
	const MyComponent = () => <div>My component</div>;

	afterEach( () => {
		if ( wrapper ) {
			/* eslint-disable react/no-find-dom-node */
			ReactDOM.unmountComponentAtNode( ReactDOM.findDOMNode( wrapper ).parentNode );
		}
		if ( shallowWrapper ) {
			shallowWrapper.unmount();
		}
		/* eslint-enable react/no-find-dom-node */
		removeAllFilters( hookName );
	} );

	it( 'should display original component when no filters applied', () => {
		const EnhancedComponent = withFilters( hookName )( MyComponent );

		shallowWrapper = shallow( <EnhancedComponent /> );

		expect( shallowWrapper.html() ).toBe( '<div>My component</div>' );
	} );

	it( 'should display a component overridden by the filter', () => {
		const OverriddenComponent = () => <div>Overridden component</div>;
		addFilter(
			'EnhancedComponent',
			'test/enhanced-component-override',
			() => OverriddenComponent
		);
		const EnhancedComponent = withFilters( hookName )( MyComponent );

		shallowWrapper = shallow( <EnhancedComponent /> );

		expect( shallowWrapper.html() ).toBe( '<div>Overridden component</div>' );
	} );

	it( 'should display two components composed by the filter', () => {
		const ComposedComponent = () => <div>Composed component</div>;
		addFilter(
			hookName,
			'test/enhanced-component-compose',
			( FilteredComponent ) => () => (
				<div>
					<FilteredComponent />
					<ComposedComponent />
				</div>
			)
		);
		const EnhancedComponent = withFilters( hookName )( MyComponent );

		shallowWrapper = shallow( <EnhancedComponent /> );

		expect( shallowWrapper.html() ).toBe( '<div><div>My component</div><div>Composed component</div></div>' );
	} );

	it( 'should not re-render component when new filter added before component was mounted', () => {
		const spy = jest.fn();
		const SpiedComponent = () => {
			spy();
			return <div>Spied component</div>;
		};
		addFilter(
			hookName,
			'test/enhanced-component-spy-1',
			( FilteredComponent ) => () => (
				<blockquote>
					<FilteredComponent />
				</blockquote>
			),
		);
		const EnhancedComponent = withFilters( hookName )( SpiedComponent );

		wrapper = TestUtils.renderIntoDocument( getTestComponent( EnhancedComponent ) );

		jest.runAllTimers();

		expect( spy ).toHaveBeenCalledTimes( 1 );
		assertExpectedHtml(
			wrapper,
			'<blockquote><div>Spied component</div></blockquote>'
		);
	} );

	it( 'should re-render component once when new filter added after component was mounted', () => {
		const spy = jest.fn();
		const SpiedComponent = () => {
			spy();
			return <div>Spied component</div>;
		};
		const EnhancedComponent = withFilters( hookName )( SpiedComponent );

		wrapper = TestUtils.renderIntoDocument( getTestComponent( EnhancedComponent ) );

		spy.mockClear();
		addFilter(
			hookName,
			'test/enhanced-component-spy-1',
			( FilteredComponent ) => () => (
				<blockquote>
					<FilteredComponent />
				</blockquote>
			),
		);
		jest.runAllTimers();

		expect( spy ).toHaveBeenCalledTimes( 1 );
		assertExpectedHtml(
			wrapper,
			'<blockquote><div>Spied component</div></blockquote>'
		);
	} );

	it( 'should re-render component once when two filters added in the same animation frame', () => {
		const spy = jest.fn();
		const SpiedComponent = () => {
			spy();
			return <div>Spied component</div>;
		};
		const EnhancedComponent = withFilters( hookName )( SpiedComponent );
		wrapper = TestUtils.renderIntoDocument( getTestComponent( EnhancedComponent ) );

		spy.mockClear();

		addFilter(
			hookName,
			'test/enhanced-component-spy-1',
			( FilteredComponent ) => () => (
				<blockquote>
					<FilteredComponent />
				</blockquote>
			),
		);
		addFilter(
			hookName,
			'test/enhanced-component-spy-2',
			( FilteredComponent ) => () => (
				<section>
					<FilteredComponent />
				</section>
			),
		);
		jest.runAllTimers();

		expect( spy ).toHaveBeenCalledTimes( 1 );
		assertExpectedHtml(
			wrapper,
			'<section><blockquote><div>Spied component</div></blockquote></section>'
		);
	} );

	it( 'should re-render component twice when new filter added and removed in two different animation frames', () => {
		const spy = jest.fn();
		const SpiedComponent = () => {
			spy();
			return <div>Spied component</div>;
		};
		const EnhancedComponent = withFilters( hookName )( SpiedComponent );
		wrapper = TestUtils.renderIntoDocument( getTestComponent( EnhancedComponent ) );

		spy.mockClear();
		addFilter(
			hookName,
			'test/enhanced-component-spy',
			( FilteredComponent ) => () => (
				<div>
					<FilteredComponent />
				</div>
			),
		);
		jest.runAllTimers();

		removeFilter(
			hookName,
			'test/enhanced-component-spy',
		);
		jest.runAllTimers();

		expect( spy ).toHaveBeenCalledTimes( 2 );
		assertExpectedHtml(
			wrapper,
			'<div>Spied component</div>'
		);
	} );

	it( 'should re-render both components once each when one filter added', () => {
		const spy = jest.fn();
		const SpiedComponent = () => {
			spy();
			return <div>Spied component</div>;
		};
		const EnhancedComponent = withFilters( hookName )( SpiedComponent );
		const CombinedComponents = () => (
			<section>
				<EnhancedComponent />
				<EnhancedComponent />
			</section>
		);
		wrapper = TestUtils.renderIntoDocument( getTestComponent( CombinedComponents ) );

		spy.mockClear();
		addFilter(
			hookName,
			'test/enhanced-component-spy-1',
			( FilteredComponent ) => () => (
				<blockquote>
					<FilteredComponent />
				</blockquote>
			),
		);
		jest.runAllTimers();

		expect( spy ).toHaveBeenCalledTimes( 2 );
		assertExpectedHtml(
			wrapper,
			'<section><blockquote><div>Spied component</div></blockquote><blockquote><div>Spied component</div></blockquote></section>'
		);
	} );
} );
