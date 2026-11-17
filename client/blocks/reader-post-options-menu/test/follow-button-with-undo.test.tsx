/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import FollowButtonWithUndo from '../follow-button-with-undo';

let buttonProps: { onFollowSuccess: ( isFollowing: boolean ) => void };
jest.mock( 'calypso/reader/follow-button', () => ( props: typeof buttonProps ) => {
	buttonProps = props;
	return null;
} );

const mockShowUndoNotice = jest.fn();
jest.mock( 'calypso/reader/data/site-subscriptions/use-unsubscribe-with-undo', () => ( {
	useUnsubscribeUndoNotice: () => mockShowUndoNotice,
} ) );

const props = {
	siteUrl: 'https://example.com/feed',
	siteName: 'Example Blog',
	followSource: 'reader-post-options-menu',
};

describe( 'FollowButtonWithUndo', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test.each( [
		[
			'unsubscribe',
			false,
			[ [ { feedUrl: props.siteUrl, siteName: props.siteName, source: props.followSource } ] ],
		],
		[ 'subscribe', true, [] ],
	] )( 'shows the undo notice only after an unsubscribe: %s', ( _, isFollowing, expectedCalls ) => {
		render( <FollowButtonWithUndo { ...props } /> );

		buttonProps.onFollowSuccess( isFollowing );

		expect( mockShowUndoNotice.mock.calls ).toEqual( expectedCalls );
	} );
} );
