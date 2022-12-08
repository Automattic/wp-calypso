import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import PopoverMenuItemQrCode from 'calypso/components/popover-menu/item-qr-code';
import { getPost } from 'calypso/state/posts/selectors';

const noop = () => {};

function PostActionsEllipsisMenuQRCode( { globalId, handleClick = noop } ) {
	const translate = useTranslate();

	const post = useSelector( ( state ) => getPost( state, globalId ) );

	if ( ! post || ! post.URL || ! post.status ) {
		return null;
	}

	// The QR option will be available only for `publish` status
	if ( post.status !== 'publish' ) {
		return null;
	}

	return (
		<PopoverMenuItemQrCode url={ post.URL } handleClick={ handleClick }>
			{ translate( 'QR Code' ) }
		</PopoverMenuItemQrCode>
	);
}

PostActionsEllipsisMenuQRCode.propTypes = {
	globalId: PropTypes.string,
};

export default PostActionsEllipsisMenuQRCode;
