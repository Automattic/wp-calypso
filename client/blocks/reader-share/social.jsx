import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import ReaderFacebookIcon from 'calypso/reader/components/icons/facebook-icon';
import ReaderTwitterIcon from 'calypso/reader/components/icons/twitter-icon';
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';
import * as stats from 'calypso/reader/stats';
import { useDispatch } from 'calypso/state';
import { infoNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

/**
 * Local variables
 */
const actionMap = {
	twitter( post ) {
		const baseUrl = new URL( 'https://twitter.com/intent/tweet' );
		const params = new URLSearchParams( {
			text: post.title,
			url: post.URL,
		} );
		baseUrl.search = params.toString();

		const twitterUrl = baseUrl.href;

		window.open( twitterUrl, 'twitter', 'width=550,height=420,resizeable,scrollbars' );
	},
	facebook( post ) {
		const baseUrl = new URL( 'https://www.facebook.com/sharer.php' );
		const params = new URLSearchParams( {
			u: post.URL,
			app_id: config( 'facebook_api_key' ),
		} );
		baseUrl.search = params.toString();

		const facebookUrl = baseUrl.href;

		window.open( facebookUrl, 'facebook', 'width=626,height=436,resizeable,scrollbars' );
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
				action="twitter"
				className="reader-share__popover-item"
				title={ translate( 'Share on Twitter' ) }
				focusOnHover={ false }
			>
				<ReaderTwitterIcon iconSize={ 20 } />
				<span>Twitter</span>
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
