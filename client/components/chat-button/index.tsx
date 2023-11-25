import { isJetpackPurchasableItem } from '@automattic/calypso-products';
import { Button, Gridicon, Spinner } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { useChatStatus, useChatWidget } from '@automattic/help-center/src/hooks';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { ObjectWithProducts } from 'calypso/lib/cart-values/cart-items';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { MessagingGroup } from '@automattic/help-center/src/hooks/use-messaging-availability';
import type { FC } from 'react';
type ChatIntent = 'SUPPORT' | 'PRESALES' | 'PRECANCELLATION';
type KeyType = 'akismet' | 'jpAgency' | 'jpCheckout' | 'jpGeneral' | 'wpcom';
type Props = {
	borderless?: boolean;
	chatIntent?: ChatIntent;
	className?: string;
	initialMessage: string;
	onClick?: () => void;
	onError?: () => void;
	primary?: boolean;
	siteUrl?: string;
	children?: React.ReactNode;
};

const HELP_CENTER_STORE = HelpCenter.register();

// Find out what service's products are in the cart currently
function getChatKey( responseCart: ObjectWithProducts ) {
	const hasCartJetpackProductsOnly =
		responseCart?.products?.length > 0 &&
		responseCart?.products?.every( ( product ) =>
			isJetpackPurchasableItem( product.product_slug )
		);

	if ( isAkismetCheckout() ) {
		return 'akismet';
	} else if ( isJetpackCheckout() || hasCartJetpackProductsOnly ) {
		return 'jpCheckout';
	}

	return 'wpcom';
}

function getGroupName( keyType: KeyType ) {
	switch ( keyType ) {
		case 'akismet':
		case 'jpAgency':
		case 'jpCheckout':
		case 'jpGeneral':
			return 'jp_presales';
		case 'wpcom':
		default:
			return 'wpcom_presales';
	}
}

function getMessagingGroupForIntent( chatIntent: ChatIntent, keyType: KeyType ): MessagingGroup {
	switch ( chatIntent ) {
		case 'PRESALES':
			return getGroupName( keyType );

		case 'PRECANCELLATION':
		case 'SUPPORT':
		default:
			return 'wpcom_messaging';
	}
}

/**
 * ChatButton - A button that opens a chat widget when clicked.
 * If the user is not eligible for chat, it will open the help center instead.
 *
 * This component currently needs to be wrapped in a ShoppingCartProvider to work
 * properly. See client/my-sites/checkout/calypso-shopping-cart-provider.tsx
 */

// TODO - decouple this component from the shopping cart

const ChatButton: FC< Props > = ( {
	borderless = true,
	chatIntent = 'SUPPORT',
	children,
	className = '',
	initialMessage,
	onClick,
	onError,
	primary = false,
	siteUrl,
} ) => {
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId );
	const { responseCart } = useShoppingCart( siteId ?? undefined );
	const messagingGroup = getMessagingGroupForIntent( chatIntent, getChatKey( responseCart ) );

	const {
		canConnectToZendesk,
		hasActiveChats,
		isChatAvailable,
		isEligibleForChat,
		isPrecancellationChatOpen,
		isPresalesChatOpen,
	} = useChatStatus( messagingGroup );
	const { setShowHelpCenter, setInitialRoute } = useDataStoreDispatch( HELP_CENTER_STORE );

	function shouldShowChatButton() {
		if ( isEligibleForChat && hasActiveChats ) {
			return true;
		}

		switch ( chatIntent ) {
			case 'PRESALES':
				if ( ! isPresalesChatOpen ) {
					return false;
				}
				break;

			case 'PRECANCELLATION':
				if ( ! isPrecancellationChatOpen ) {
					return false;
				}
				break;
			default:
				break;
		}

		if ( isEligibleForChat && isChatAvailable ) {
			return true;
		}

		return false;
	}

	const { isOpeningChatWidget, openChatWidget } = useChatWidget();

	const handleClick = () => {
		if ( canConnectToZendesk ) {
			openChatWidget( initialMessage, siteUrl, onError, onClick );
		} else {
			setInitialRoute( '/contact-form?mode=CHAT' );
			setShowHelpCenter( true );
			onClick?.();
		}
	};

	const classes = classnames( 'chat-button', className );

	if ( ! shouldShowChatButton() ) {
		return null;
	}

	function getChildren() {
		if ( isOpeningChatWidget ) {
			return <Spinner />;
		}

		return children || <Gridicon icon="chat" />;
	}

	return (
		<Button
			className={ classes }
			primary={ primary }
			borderless={ borderless }
			onClick={ handleClick }
			title={ __( 'Support Chat' ) }
		>
			{ getChildren() }
		</Button>
	);
};

export default ChatButton;
