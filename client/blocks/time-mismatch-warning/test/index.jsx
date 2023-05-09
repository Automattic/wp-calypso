/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { getPreference } from 'calypso/state/preferences/selectors';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import { TimeMismatchWarning } from '../index';

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

describe( 'TimeMismatchWarning', () => {
	beforeAll( () => {
		jest.spyOn( global.Date.prototype, 'getTimezoneOffset' ).mockImplementation( () => 240 );
	} );

	test( 'to render nothing if no site ID is provided', () => {
		const { container } = render( <TimeMismatchWarning settingsUrl="https://example.com" /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'to render nothing if no settings URL is provided', () => {
		const { container } = render( <TimeMismatchWarning siteId={ 1 } /> );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'to render nothing if times match', () => {
		const { container } = render(
			<TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'to render nothing if the user preference is dismissed', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		getPreference.mockReturnValueOnce( () => true );
		const { container } = render(
			<TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" />
		);
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'to render if GMT offsets do not match', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const { container } = render(
			<TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" />
		);
		expect( container ).toMatchSnapshot();
	} );

	test( 'to render the passed site settings URL', () => {
		const translate = jest.fn( ( text ) => text );
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		useTranslate.mockImplementationOnce( () => translate );
		render( <TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" /> );
		expect( translate ).toMatchSnapshot();
	} );

	test( 'to render the status if set', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const { container } = render(
			<TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" status="is-error" />
		);
		expect( container.firstChild ).toHaveClass( 'is-error' );
	} );

	test( 'to dispatch user preference setting on dismiss click', () => {
		const dispatch = jest.fn( () => null );
		useDispatch.mockReturnValueOnce( dispatch );
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		render( <TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" /> );
		const dismissButton = screen.getByRole( 'button' );
		fireEvent.click( dismissButton );
		expect( dispatch ).toHaveBeenCalled();
	} );
} );
