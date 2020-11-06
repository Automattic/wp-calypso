/* eslint-disable no-irregular-whitespace */
/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { TimeMismatchWarning } from '../index';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import { getPreference } from 'calypso/state/preferences/selectors';

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: jest.fn( ( func ) => func() ),
	useDispatch: jest.fn( () => null ),
} ) );
jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: jest.fn( () => ( text ) => text ),
} ) );
jest.mock( 'calypso/state/selectors/get-site-gmt-offset', () => jest.fn( () => -4 ) );
jest.mock( 'calypso/state/sites/selectors/get-site-slug', () => jest.fn( () => 'wordpress.test' ) );
jest.mock( 'calypso/state/preferences/selectors', () => ( {
	hasReceivedRemotePreferences: jest.fn( () => true ),
	getPreference: jest.fn( () => false ),
} ) );
jest.mock( 'calypso/components/notice', () => ( { status, onDismissClick, children } ) => (
	<button className={ status } onClick={ onDismissClick }>
		{ children }
	</button>
) );

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

	test( 'to render nothing if the user preference is dismissed', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		getPreference.mockReturnValueOnce( () => true );
		const wrapper = shallow( <TimeMismatchWarning siteId={ 1 } /> );
		expect( wrapper.isEmptyRender() ).toBeTruthy();
	} );

	test( 'to render if GMT offsets do not match', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const wrapper = shallow( <TimeMismatchWarning siteId={ 1 } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'to render the passed site settings URL', () => {
		const translate = jest.fn( ( text ) => text );
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		useTranslate.mockImplementationOnce( () => translate );
		shallow( <TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" /> );
		expect( translate ).toMatchSnapshot();
	} );

	test( 'to render the status if set', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const wrapper = shallow( <TimeMismatchWarning siteId={ 1 } status="is-error" /> );
		expect( wrapper.dive().prop( 'className' ) ).toEqual( 'is-error' );
	} );

	test( 'to dispatch user preference setting on dismiss click', () => {
		const dispatch = jest.fn( () => null );
		useDispatch.mockReturnValueOnce( dispatch );
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const wrapper = shallow( <TimeMismatchWarning siteId={ 1 } /> );
		const onDismissClick = wrapper.prop( 'onDismissClick' );
		onDismissClick();
		expect( dispatch ).toHaveBeenCalled();
	} );
} );
