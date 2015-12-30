require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
import chai from 'chai';
import React from 'react/addons';
import sinon from 'sinon';
import mockery from 'mockery';

const expect = chai.expect,
	TestUtils = React.addons.TestUtils;

const EMPTY_COMPONENT = React.createClass( {
	render: function() {
		return <div />;
	}
} );

describe( 'Search', function() {
	beforeEach( function() {
		mockery.registerMock( 'analytics', {} );
		mockery.registerMock( 'components/gridicon', EMPTY_COMPONENT );
		mockery.enable();
		mockery.warnOnUnregistered( false );

		this.searchClass = require( '../' );
		this.searchClass.prototype.__reactAutoBindMap.translate = sinon.stub();
	} );

	afterEach( function() {
		mockery.deregisterMock( 'analytics' );
		mockery.disable();

		delete this.searchClass.prototype.__reactAutoBindMap.translate;
	} );

	describe( 'initialValue', function() {
		beforeEach( function() {
			this.onSearch = sinon.stub();
		} );

		context( 'with initialValue', function() {
			beforeEach( function() {
				this.initialValue = 'hello';
				this.searchElement = React.createElement( this.searchClass, {
					initialValue: this.initialValue,
					onSearch: this.onSearch
				} );
				this.rendered = TestUtils.renderIntoDocument( this.searchElement );
			} );

			it( 'should set state.keyword with the initialValue after mount', function() {
				expect( this.rendered.state.keyword ).to.equal( this.initialValue );
			} );
		} );
		context( 'without initialValue', function() {
			beforeEach( function() {
				this.searchElement = React.createElement( this.searchClass, {
					onSearch: this.onSearch
				} );
				this.rendered = TestUtils.renderIntoDocument( this.searchElement );
			} );

			it( 'should set state.keyword empty string after mount', function() {
				expect( this.rendered.state.keyword ).to.equal( '' );
			} );
		} );
	} );
} );
