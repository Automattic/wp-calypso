/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import recordWidgetEvent, {
	recordWidgetEventThenFollow,
	recordWidgetEventThenOpen,
} from '../record-widget-event';

jest.mock( 'calypso/lib/analytics/tracks', () => ( { recordTracksEvent: jest.fn() } ) );

const clickOn = ( { href = 'https://example.test/next', target = '_self', ...keys } = {} ) => ( {
	metaKey: false,
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	...keys,
	currentTarget: { href, target },
	preventDefault: jest.fn(),
} );

describe( 'recordWidgetEvent', () => {
	beforeEach( () => {
		recordTracksEvent.mockClear();
		jest.useFakeTimers();
		delete window.location;
		window.location = { href: 'https://example.test/wp-admin/' };
	} );

	afterEach( () => jest.useRealTimers() );

	it( 'prefixes the event name and passes the properties through', () => {
		recordWidgetEvent( 'date_range_changed', { range: 'last_30_days' } );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_odyssey_stats_widget_date_range_changed',
			{ range: 'last_30_days' }
		);
	} );

	describe( 'recordWidgetEventThenOpen', () => {
		it( 'records, holds the navigation, then opens the URL', () => {
			recordWidgetEventThenOpen( 'https://example.test/next', 'chart_bucket_clicked', {
				range: 'last_7_days',
				unit: 'day',
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'jetpack_odyssey_stats_widget_chart_bucket_clicked',
				{ range: 'last_7_days', unit: 'day' }
			);
			expect( window.location.href ).toBe( 'https://example.test/wp-admin/' );

			jest.runAllTimers();
			expect( window.location.href ).toBe( 'https://example.test/next' );
		} );

		it( 'counts a click repeated while the URL is held once', () => {
			recordWidgetEventThenOpen( 'https://example.test/next', 'post_clicked' );
			recordWidgetEventThenOpen( 'https://example.test/other', 'post_clicked' );

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );

			jest.runAllTimers();
			expect( window.location.href ).toBe( 'https://example.test/next' );
		} );
	} );

	describe( 'recordWidgetEventThenFollow', () => {
		it( 'records, holds the navigation, then follows the link', () => {
			const event = clickOn();
			recordWidgetEventThenFollow( 'see_more_clicked', { tab: 'top_posts' } )( event );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'jetpack_odyssey_stats_widget_see_more_clicked',
				{ tab: 'top_posts' }
			);
			expect( event.preventDefault ).toHaveBeenCalled();
			expect( window.location.href ).toBe( 'https://example.test/wp-admin/' );

			jest.runAllTimers();
			expect( window.location.href ).toBe( 'https://example.test/next' );
		} );

		it( 'counts a click repeated while the link is held once', () => {
			const follow = recordWidgetEventThenFollow( 'post_clicked' );
			const second = clickOn( { href: 'https://example.test/other' } );
			follow( clickOn() );
			follow( second );

			expect( recordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( second.preventDefault ).toHaveBeenCalled();

			jest.runAllTimers();
			expect( window.location.href ).toBe( 'https://example.test/next' );

			follow( clickOn() );
			expect( recordTracksEvent ).toHaveBeenCalledTimes( 2 );
		} );

		it.each( [
			{ target: '_blank' },
			{ metaKey: true },
			{ ctrlKey: true },
			{ shiftKey: true },
			{ altKey: true },
		] )( 'leaves a click that opens elsewhere alone: %o', ( click ) => {
			const event = clickOn( click );
			recordWidgetEventThenFollow( 'post_clicked' )( event );

			expect( recordTracksEvent ).toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );
	} );
} );
