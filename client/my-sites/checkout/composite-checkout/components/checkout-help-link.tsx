import config from '@automattic/calypso-config';
import {
	isWpComBusinessPlan,
	isWpComEcommercePlan,
	isWpComPersonalPlan,
	isWpComPremiumPlan,
	isPlan,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import {
	SUPPORT_HAPPYCHAT,
	SUPPORT_FORUM,
	SUPPORT_DIRECTLY,
	shouldShowHelpCenterToUser,
} from '@automattic/help-center';
import { useShoppingCart } from '@automattic/shopping-cart';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import HappychatButtonUnstyled from 'calypso/components/happychat/button';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getSupportLevel from 'calypso/state/happychat/selectors/get-support-level';
import isHappychatAvailable from 'calypso/state/happychat/selectors/is-happychat-available';
import isPresalesChatAvailable from 'calypso/state/happychat/selectors/is-presales-chat-available';
import { showInlineHelpPopover } from 'calypso/state/inline-help/actions';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getSupportVariation from 'calypso/state/selectors/get-inline-help-support-variation';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
import { setHelpCenterVisible } from 'calypso/state/ui/help-center-visible/actions';
import { getSectionName } from 'calypso/state/ui/selectors';
import type { Theme } from '@automattic/composite-checkout';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

type StyledProps = {
	theme?: Theme;
};

const HappychatButton = styled( HappychatButtonUnstyled )`
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

export function PaymentChatButton( { plan }: { plan: string | undefined } ) {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const supportLevel = useSelector( getSupportLevel );

	const chatButtonClicked = () => {
		reduxDispatch(
			recordTracksEvent( 'calypso_presales_chat_click', {
				plan,
				support_level: supportLevel,
			} )
		);
	};

	return (
		<HappychatButton onClick={ chatButtonClicked }>
			<Gridicon icon="chat" />
			{ translate( 'Need help? Chat with us.' ) }
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

export default function CheckoutHelpLink() {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const plans = responseCart.products.filter( ( product ) => isPlan( product ) );

	const supportVariationDetermined = useSelector( isSupportVariationDetermined );
	const supportVariation = useSelector( getSupportVariation );

	const happyChatAvailable = useSelector( isHappychatAvailable );
	const presalesChatAvailable = useSelector( isPresalesChatAvailable );
	const presalesEligiblePlanLabel = getHighestWpComPlanLabel( plans );
	const isPresalesChatEligible = presalesChatAvailable && presalesEligiblePlanLabel;
	const section = useSelector( getSectionName );
	const locale = useSelector( getCurrentLocaleSlug );
	const userId = useSelector( getCurrentUserId );
	const userAllowedToHelpCenter =
		config.isEnabled( 'checkout/help-center' ) &&
		userId &&
		shouldShowHelpCenterToUser( userId, locale );

	const handleHelpButtonClicked = () => {
		if ( userAllowedToHelpCenter ) {
			reduxDispatch( setHelpCenterVisible( true ) );
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_summary_help_click', {
					location: 'help-center',
					section,
				} )
			);
			return;
		}

		reduxDispatch( showInlineHelpPopover() );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_composite_summary_help_click', {
				location: 'inline-help-popover',
				section,
			} )
		);
	};

	// If chat is available and the cart has a pre-sales plan or is already eligible for chat.
	const shouldRenderPaymentChatButton =
		happyChatAvailable && ( isPresalesChatEligible || supportVariation === SUPPORT_HAPPYCHAT );

	const hasDirectSupport =
		supportVariation !== SUPPORT_DIRECTLY && supportVariation !== SUPPORT_FORUM;

	// If chat isn't available, use the inline help button instead.
	return (
		<CheckoutHelpLinkWrapper>
			<QuerySupportTypes />
			{ ! shouldRenderPaymentChatButton && ! supportVariationDetermined && <LoadingButton /> }
			{ shouldRenderPaymentChatButton ? (
				<PaymentChatButton plan={ presalesEligiblePlanLabel } />
			) : (
				supportVariationDetermined && (
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
				)
			) }
		</CheckoutHelpLinkWrapper>
	);
}

function getHighestWpComPlanLabel( plans: ResponseCartProduct[] ) {
	const planMatchersInOrder = [
		{ label: 'WordPress.com eCommerce', matcher: isWpComEcommercePlan },
		{ label: 'WordPress.com Business', matcher: isWpComBusinessPlan },
		{ label: 'WordPress.com Premium', matcher: isWpComPremiumPlan },
		{ label: 'WordPress.com Personal', matcher: isWpComPersonalPlan },
	];
	for ( const { label, matcher } of planMatchersInOrder ) {
		for ( const plan of plans ) {
			if ( matcher( plan.product_slug ) ) {
				return label;
			}
		}
	}
}
