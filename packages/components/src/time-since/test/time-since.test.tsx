/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import TimeSince from '..';

// Mock useTranslate from i18n-calypso
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => {
		const t = (
			str: string,
			opts?: { args: { minutes: string; hours: string; days: string } }
		) => {
			if ( str === 'just now' ) {
				return 'just now';
			}
			if ( ! opts ) {
				return str;
			}
			if ( str === '%(minutes)dm ago' ) {
				return `${ opts.args.minutes }m ago`;
			}
			if ( str === '%(hours)dh ago' ) {
				return `${ opts.args.hours }h ago`;
			}
			if ( str === '%(days)dd ago' ) {
				return `${ opts.args.days }d ago`;
			}
			return str;
		};
		t.localeSlug = 'en';
		return t;
	},
} ) );

// Helper to freeze time
const FIXED_NOW = new Date( '2024-06-12T12:00:00Z' );
beforeAll( () => {
	jest.useFakeTimers();
	jest.setSystemTime( FIXED_NOW );
} );
afterAll( () => {
	jest.useRealTimers();
} );

describe( 'TimeSince', () => {
	it( 'renders "just now" for dates less than 60 seconds ago', () => {
		const date = new Date( FIXED_NOW.getTime() - 30 * 1000 ).toISOString();
		render( <TimeSince date={ date } /> );
		expect( screen.getByText( 'just now' ) ).toBeInTheDocument();
	} );

	it( 'renders minutes ago for dates less than 60 minutes ago', () => {
		const date = new Date( FIXED_NOW.getTime() - 5 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } /> );
		expect( screen.getByText( '5m ago' ) ).toBeInTheDocument();
	} );

	it( 'renders hours ago for dates less than 24 hours ago', () => {
		const date = new Date( FIXED_NOW.getTime() - 3 * 60 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } /> );
		expect( screen.getByText( '3h ago' ) ).toBeInTheDocument();
	} );

	it( 'renders days ago for dates less than 7 days ago', () => {
		const date = new Date( FIXED_NOW.getTime() - 2 * 24 * 60 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } /> );
		expect( screen.getByText( '2d ago' ) ).toBeInTheDocument();
	} );

	it( 'renders formatted date for dates older than 7 days', () => {
		const date = new Date( FIXED_NOW.getTime() - 10 * 24 * 60 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } /> );
		// Default format is 'll', which is medium date (e.g., "Jun 2, 2024")
		const formatted = new Intl.DateTimeFormat( 'en', { dateStyle: 'medium' } ).format(
			new Date( date )
		);
		expect( screen.getByText( formatted ) ).toBeInTheDocument();
	} );

	it( 'renders empty string for invalid date', () => {
		render( <TimeSince date="not-a-date" /> );
		const timeEl = screen.getByRole( 'time' );
		expect( timeEl ).toBeInTheDocument();
		expect( timeEl ).toHaveTextContent( '' );
	} );

	it( 'renders formatted date for future date', () => {
		const date = new Date( FIXED_NOW.getTime() + 60 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } /> );
		const formatted = new Intl.DateTimeFormat( 'en', { dateStyle: 'medium' } ).format(
			new Date( date )
		);
		expect( screen.getByText( formatted ) ).toBeInTheDocument();
	} );

	it( 'applies className and sets title attribute', () => {
		const date = new Date( FIXED_NOW.getTime() - 5 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } className="my-class" /> );
		const timeEl = screen.getByText( '5m ago' );
		expect( timeEl ).toHaveClass( 'my-class' );
		expect( timeEl ).toHaveAttribute( 'title' );
	} );

	it( 'uses dateFormat prop', () => {
		const date = new Date( FIXED_NOW.getTime() - 10 * 24 * 60 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } dateFormat="lll" /> );
		const d = new Date( date );
		const formatted = new Intl.DateTimeFormat( 'en', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		} ).format( d );
		expect( screen.getByText( formatted ) ).toBeInTheDocument();
	} );

	it( 'uses locale prop', () => {
		const date = new Date( FIXED_NOW.getTime() - 10 * 24 * 60 * 60 * 1000 ).toISOString();
		render( <TimeSince date={ date } locale="es-ES" /> );
		const formatted = new Intl.DateTimeFormat( 'en', { dateStyle: 'medium' } ).format(
			new Date( date )
		);
		expect( screen.getByText( formatted ) ).toBeInTheDocument();
	} );
} );
