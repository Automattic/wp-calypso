/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import ReaderFollowButton from '..';

let containerProps: { onFollowSuccess: ( isFollowing: boolean ) => void };
jest.mock( 'calypso/blocks/follow-button', () => ( props: typeof containerProps ) => {
	containerProps = props;
	return null;
} );

const mockShowUndoNotice = jest.fn();
jest.mock( 'calypso/reader/data/site-subscriptions/use-unsubscribe-with-undo', () => ( {
	useUnsubscribeUndoNotice: () => mockShowUndoNotice,
} ) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: () => true,
} ) );

const props = {
	siteUrl: 'https://example.com/feed',
	siteName: 'Example Blog',
	followSource: 'reader-post-options-menu',
};

describe( 'ReaderFollowButton', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	const noticeParams = {
		feedUrl: props.siteUrl,
		siteName: props.siteName,
		source: props.followSource,
	};

	test.each( [
		[ 'shows', true, false, [ [ noticeParams ] ] ],
		[ 'does not show', true, true, [] ],
		[ 'does not show', false, false, [] ],
	] )(
		'%s the undo notice when showUnsubscribeUndo is %s and the site is followed: %s',
		( _, showUnsubscribeUndo, isFollowing, expectedCalls ) => {
			const onFollowSuccess = jest.fn();
			render(
				<ReaderFollowButton
					{ ...props }
					showUnsubscribeUndo={ showUnsubscribeUndo }
					onFollowSuccess={ onFollowSuccess }
				/>
			);

			containerProps.onFollowSuccess( isFollowing );

			expect( mockShowUndoNotice.mock.calls ).toEqual( expectedCalls );
			expect( onFollowSuccess ).toHaveBeenCalledWith( isFollowing );
		}
	);
} );
