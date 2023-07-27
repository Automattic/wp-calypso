import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import PopoverMenuItemClipboard from 'calypso/components/popover-menu/item-clipboard';
import ReaderFacebookIcon from 'calypso/reader/components/icons/facebook-icon';
import ReaderTwitterIcon from 'calypso/reader/components/icons/twitter-icon';
import ReaderPopoverMenu from 'calypso/reader/components/reader-popover/menu';

const ReaderSocialShareSelection = ( props ) => {
	const translate = useTranslate();

	return (
		<ReaderPopoverMenu { ...props.popoverProps } popoverTitle={ translate( 'Share on' ) }>
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
				onCopy={ props.onCopyLinkClick }
				icon="link"
			>
				{ translate( 'Copy link' ) }
			</PopoverMenuItemClipboard>
		</ReaderPopoverMenu>
	);
};

export default ReaderSocialShareSelection;
