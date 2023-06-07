import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { SUPPORT_FORUM } from '@automattic/help-center';
import { ResponseCartMessage, useShoppingCart } from '@automattic/shopping-cart';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import HappychatButtonUnstyled from 'calypso/components/happychat/button';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSupportLevel from 'calypso/state/happychat/selectors/get-support-level';
import getSupportVariation from 'calypso/state/selectors/get-inline-help-support-variation';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
import { getSectionName } from 'calypso/state/ui/selectors';
import type { Theme } from '@automattic/composite-checkout';
import type { HelpCenterSelect } from '@automattic/data-stores';
import type { KeyType } from 'calypso/lib/presales-chat';

const HELP_CENTER_STORE = HelpCenter.register();

type StyledProps = {
	theme?: Theme;
};

type HappychatButtonProps = {
	onClick: () => void;
	theme?: Theme;
	openHelpCenter: boolean;
};

const HappychatButton: React.FC< HappychatButtonProps > = styled( HappychatButtonUnstyled )`
	margin: 0;
	padding: 0;

	svg {
		margin-right: 6px;
		width: 20px;

		.rtl & {
			margin-right: 0;
			margin-left: 6px;
		}
	}
`;

export function PaymentChatButton( {
	plan,
	openHelpCenter,
}: {
	plan: string | undefined;
	openHelpCenter: boolean;
} ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const supportLevel = useSelector( getSupportLevel );
	const section = useSelector( getSectionName );

	const chatButtonClicked = () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_presales_chat_click', {
				plan,
				support_level: supportLevel,
				location: openHelpCenter ? 'help-center' : 'inline-help-popover',
				section,
			} )
		);
	};

	return (
		<HappychatButton onClick={ chatButtonClicked } openHelpCenter={ openHelpCenter }>
			<>
				<Gridicon icon="chat" />
				{ translate( 'Need help? Chat with us.' ) }
			</>
		</HappychatButton>
	);
}

const CheckoutHelpLinkWrapper = styled.div< StyledProps >`
	background: ${ ( props ) => props.theme.colors.surface };
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 0;
	padding: 20px;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		background: transparent;
		border-top: 0 none;
		margin: 12px 0;
		padding: 0;
	}
`;

const CheckoutSummaryHelpButton = styled.button`
	margin: 0;
	padding: 0;
	text-align: left;

	.rtl & {
		text-align: right;
	}

	span {
		cursor: pointer;
		text-decoration: underline;
		color: var( --color-link );

		&:hover {
			text-decoration: none;
		}
	}
`;

const pulse = keyframes`
	0% { opacity: 1; }

	70% { opacity: 0.25; }

	100% { opacity: 1; }
`;

const LoadingButton = styled.p< StyledProps >`
	animation: ${ pulse } 1.5s ease-in-out infinite;
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	border-radius: 2px;
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	content: '';
	font-size: 14px;
	height: 18px;
	margin: 12px 8px 0;
	padding: 0;
	position: relative;
`;

function getKeyTypeForPresalesChat(): KeyType {
	if ( isAkismetCheckout() ) {
		return 'akismet';
	}

	if ( isJetpackCheckout() ) {
		return 'jpCheckout';
	}

	return 'wpcom';
}

export default function CheckoutHelpLink() {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const { setShowHelpCenter, setShowMessagingLauncher } = useDataStoreDispatch( HELP_CENTER_STORE );

	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	const cartErrors = responseCart.messages?.persistent_errors || [];
	const purchasesAreBlocked = cartErrors.some(
		( error: ResponseCartMessage ) => error.code === 'blocked'
	);

	const { section, supportVariationDetermined, supportVariation } = useSelector( ( state ) => {
		return {
			section: getSectionName( state ),
			supportVariationDetermined: isSupportVariationDetermined( state ),
			supportVariation: getSupportVariation( state ),
		};
	} );

	const handleHelpButtonClicked = () => {
		reduxDispatch( setShowHelpCenter( true ) );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_composite_summary_help_click', {
				location: 'help-center',
				section,
			} )
		);
	};

	const { isChatActive, isLoading: isLoadingChat } = usePresalesChat(
		getKeyTypeForPresalesChat(),
		! purchasesAreBlocked
	);

	const { isMessagingWidgetShown } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isMessagingWidgetShown: helpCenterSelect.isMessagingWidgetShown(),
		};
	}, [] );

	useEffect( () => {
		if ( isChatActive ) {
			setShowMessagingLauncher( true );
		}
		return () => {
			if ( ! isMessagingWidgetShown && isChatActive ) {
				setShowMessagingLauncher( false );
			}
		};
	}, [ isChatActive, setShowMessagingLauncher, isMessagingWidgetShown ] );

	const shouldShowLoadingButton = ! supportVariationDetermined || isLoadingChat;

	const hasDirectSupport = supportVariation !== SUPPORT_FORUM;

	return (
		<CheckoutHelpLinkWrapper>
			<QuerySupportTypes />
			{ shouldShowLoadingButton && <LoadingButton /> }
			{ ! shouldShowLoadingButton && ! isChatActive && (
				<CheckoutSummaryHelpButton onClick={ handleHelpButtonClicked }>
					{ hasDirectSupport
						? translate( 'Questions? {{underline}}Ask a Happiness Engineer{{/underline}}', {
								components: {
									underline: <span />,
								},
						  } )
						: translate(
								'Questions? {{underline}}Read more about plans and purchases{{/underline}}',
								{
									components: {
										underline: <span />,
									},
								}
						  ) }
				</CheckoutSummaryHelpButton>
			) }
		</CheckoutHelpLinkWrapper>
	);
}
