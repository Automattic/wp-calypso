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
jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () => jest.fn( () => 0 ) );
jest.mock( 'calypso/state/sites/selectors/get-site-slug', () => jest.fn( () => 'wordpress.test' ) );

describe( 'TimeMismatchWarning', () => {
	beforeAll( () => {
		jest.spyOn( global, 'Date' ).mockImplementation( () => ( { getTimezoneOffset: () => 0 } ) );
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
		  Looks like your computer time and site time don’t match! We’re going to show you times based on your site. If that doesn’t look right, you can {{SiteSettings}}go here to update it{{/SiteSettings}}.
		</Localized(Notice)>
	` );
	} );
} );
