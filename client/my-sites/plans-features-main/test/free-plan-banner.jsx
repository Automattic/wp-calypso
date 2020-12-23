jest.mock( 'i18n-calypso', () => ( {
	localize: ( Component ) => ( props ) => <Component { ...props } translate={ ( x ) => x } />,
	numberFormat: ( x ) => x,
	translate: ( x ) => x,
	useTranslate: jest.fn( () => ( x ) => x ),
} ) );

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import FreePlanBanner from '../free-plan-banner';

describe( '<FreePlanBanner />', () => {
	it( 'should be hidden when hidden prop is true', () => {
		const node = shallow( <FreePlanBanner hidden /> );
		expect( node.isEmptyRender() ).toBe( true );
	} );

	it( 'should be hidden when customHeader is passed', () => {
		const node = shallow( <FreePlanBanner customHeader={ {} } /> );
		expect( node.isEmptyRender() ).toBe( true );
	} );
} );
