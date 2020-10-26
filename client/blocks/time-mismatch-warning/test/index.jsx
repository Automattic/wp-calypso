/* eslint-disable no-irregular-whitespace */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { TimeMismatchWarning } from '../index';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( func ) => func() ),
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () => jest.fn( () => -4 ) );
jest.mock( 'calypso/state/sites/selectors/get-site-slug', () => jest.fn( () => 'wordpress.test' ) );

describe( 'TimeMismatchWarning', () => {
	beforeAll( () => {
		jest.spyOn( global, 'Date' ).mockImplementation( () => ( { getTimezoneOffset: () => 240 } ) );
	} );

	afterAll( () => {
		jest.spyOn( global, 'Date' ).mockRestore();
	} );

	test( 'to render nothing if no site ID is provided', () => {
		const wrapper = shallow( <TimeMismatchWarning /> );
		expect( wrapper.isEmptyRender() ).toBeTruthy();
	} );

	test( 'to render nothing if times match', () => {
		const wrapper = shallow( <TimeMismatchWarning siteId={ 1 } /> );
		expect( wrapper.isEmptyRender() ).toBeTruthy();
	} );

	test( 'to render if GMT offsets do not match', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const wrapper = shallow( <TimeMismatchWarning siteId={ 1 } /> );
		expect( wrapper ).toMatchInlineSnapshot( `
		<Localized(Notice)
		  status="is-warning"
		>
		  This page reflects the time zone set on your site. It looks like that does not match your current time zone. {{SiteSettings}}You can update your site time zone here{{/SiteSettings}}.
		</Localized(Notice)>
	` );
	} );
} );
