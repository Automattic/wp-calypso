import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import ReaderFacebookIcon from 'calypso/reader/components/icons/facebook-icon';
import ReaderXIcon from 'calypso/reader/components/icons/x-icon';
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';
import * as stats from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { infoNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

const getWindowCenterPosition = ( targetWidth, targetHeight ) => {
	return {
		left: window.screenX + ( window.innerWidth / 2 - targetWidth / 2 ),
		top: window.screenY + ( window.innerHeight / 2 - targetHeight / 2 ),
	};
};

/**
 * Local variables
 */
const actionMap = {
	x( post ) {
		// Note: Changing the base URL to x.com breaks the sharing of the featured image
		// when sharing the post; it seems the Twitter API may have been updated in the move
		// to X. This works well as is, so let's just leave it for now. In the future, we can
		// consider updating the base URL if this endpoint becomes deprecated or stops working.
		const baseUrl = new URL( 'https://twitter.com/intent/tweet' );
		const params = new URLSearchParams( {
			text: post.title,
			url: post.URL,
		} );
		baseUrl.search = params.toString();

		const xUrl = baseUrl.href;
		const width = 550;
		const height = 420;
		const { left, top } = getWindowCenterPosition( width, height );

		window.open(
			xUrl,
			'x',
			`width=${ width },height=${ height },left=${ left },top=${ top },resizable,scrollbars`
		);
	},
	facebook( post ) {
		const baseUrl = new URL( 'https://www.facebook.com/sharer.php' );
		const params = new URLSearchParams( {
			u: post.URL,
			app_id: config( 'facebook_api_key' ),
		} );
		baseUrl.search = params.toString();

		const facebookUrl = baseUrl.href;

		const width = 626;
		const height = 436;
		const { left, top } = getWindowCenterPosition( width, height );

		window.open(
			facebookUrl,
			'facebook',
			`width=${ width },height=${ height },left=${ left },top=${ top },resizable,scrollbars`
		);
	},
	copy_link() {},
};

const ReaderSocialShareSelection = ( props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onCopyLinkClick = () => {
		dispatch( infoNotice( translate( 'Link copied to clipboard.' ), { duration: 3000 } ) );
	};

	const closeExternalShareMenu = ( action ) => {
		props.closeMenu();
		const actionFunc = actionMap[ action ];
		if ( actionFunc ) {
			stats.recordAction( 'share_' + action );
			stats.recordGaEvent( 'Clicked on Share to ' + action );
			dispatch(
				recordReaderTracksEvent(
					'calypso_reader_share_action_picked',
					{
						action: action,
					},
					{ post: props.post }
				)
			);
			actionFunc( props.post );
		}
	};

	return (
		<ReaderPopoverMenu
			{ ...props.popoverProps }
			popoverTitle={ translate( 'Share on' ) }
			onClose={ closeExternalShareMenu }
		>
			<PopoverMenuItem
				action="facebook"
				className="reader-share__popover-item"
				title={ translate( 'Share on Facebook' ) }
				focusOnHover={ false }
			>
				<ReaderFacebookIcon iconSize={ 20 } />
				<span>Facebook</span>
			</PopoverMenuItem>
			<PopoverMenuItem
				action="x"
				className="reader-share__popover-item"
				title={ translate( 'Share on X' ) }
				focusOnHover={ false }
			>
				<ReaderXIcon iconSize={ 20 } />
				<span>X</span>
			</PopoverMenuItem>
			<PopoverMenuItemClipboard
				action="copy_link"
				text={ props.post.URL }
				onCopy={ onCopyLinkClick }
				icon="link"
			>
				{ translate( 'Copy link' ) }
			</PopoverMenuItemClipboard>
		</ReaderPopoverMenu>
	);
};

export default ReaderSocialShareSelection;
