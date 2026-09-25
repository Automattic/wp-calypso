/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import recordWidgetEvent, { recordWidgetEventThenFollow } from '../record-widget-event';

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

		it( 'leaves a new-tab link alone, since the page it was clicked from stays', () => {
			const event = clickOn( { target: '_blank' } );
			recordWidgetEventThenFollow( 'referrer_clicked' )( event );

			expect( recordTracksEvent ).toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it.each( [ 'metaKey', 'ctrlKey', 'shiftKey', 'altKey' ] )(
			'leaves a %s click alone, which the browser opens elsewhere',
			( key ) => {
				const event = clickOn( { [ key ]: true } );
				recordWidgetEventThenFollow( 'post_clicked' )( event );

				expect( recordTracksEvent ).toHaveBeenCalled();
				expect( event.preventDefault ).not.toHaveBeenCalled();
			}
		);
	} );
} );
