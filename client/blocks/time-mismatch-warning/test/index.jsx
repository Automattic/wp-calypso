/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { vi } from 'vitest';
import { getPreference } from 'calypso/state/preferences/selectors';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import { TimeMismatchWarning } from '../index';

vi.mock( 'react-redux', async () => ( {
	...( await vi.importActual( 'react-redux' ) ),
	useSelector: vi.fn( ( func ) => func() ),
	useDispatch: vi.fn( () => null ),
} ) );
vi.mock( 'i18n-calypso', async () => ( {
	...( await vi.importActual( 'i18n-calypso' ) ),
	useTranslate: vi.fn( () => ( text ) => text ),
} ) );
vi.mock( 'calypso/state/selectors/get-site-gmt-offset', () => ( { default: vi.fn( () => -4 ) } ) );
vi.mock( 'calypso/state/preferences/selectors', () => ( {
	hasReceivedRemotePreferences: vi.fn( () => true ),
	getPreference: vi.fn( () => false ),
} ) );

describe( 'TimeMismatchWarning', () => {
	beforeAll( () => {
		vi.spyOn( global.Date.prototype, 'getTimezoneOffset' ).mockImplementation( () => 240 );
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
		const translate = vi.fn( ( text ) => text );
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		useTranslate.mockImplementationOnce( () => translate );
		render( <TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" /> );
		// Assert on the interpolation component rather than snapshotting the mock:
		// React 19 elements carry non-deterministic debug/owner data that breaks
		// snapshot serialization.
		const [ , options ] = translate.mock.calls[ 0 ];
		expect( options.components.SiteSettings.props.href ).toBe( 'https://example.com' );
	} );

	test( 'to render the status if set', () => {
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		const { container } = render(
			<TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" status="is-error" />
		);
		expect( container.firstChild ).toHaveClass( 'is-error' );
	} );

	test( 'to dispatch user preference setting on dismiss click', () => {
		const dispatch = vi.fn( () => null );
		useDispatch.mockReturnValueOnce( dispatch );
		getSiteGmtOffset.mockReturnValueOnce( 10 );
		render( <TimeMismatchWarning siteId={ 1 } settingsUrl="https://example.com" /> );
		const dismissButton = screen.getByRole( 'button' );
		fireEvent.click( dismissButton );
		expect( dispatch ).toHaveBeenCalled();
	} );
} );
