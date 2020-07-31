/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { noop } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import { TimeMismatchWarning } from '../index';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn(),
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );

describe( 'TimeMismatchWarning', () => {
	test( 'to render nothing if times match', () => {
		const wrapper = shallow( <TimeMismatchWarning applySiteOffset={ noop } /> );
		expect( wrapper.isEmptyRender() ).toBeTruthy();
	} );

	test( 'to render if time does not match', () => {
		const applySiteOffset = () => moment().add( 1, 'hour' );
		const wrapper = shallow( <TimeMismatchWarning applySiteOffset={ applySiteOffset } /> );
		expect( wrapper ).toMatchInlineSnapshot( `
		<Localized(Notice)
		  status="is-warning"
		>
		  Looks like your computer time and site time don’t match! We’re going to show you times based on your site. If that doesn’t look right, you can {{SiteSettings}}go here to update it{{/SiteSettings}}.
		</Localized(Notice)>
	` );
	} );
} );
