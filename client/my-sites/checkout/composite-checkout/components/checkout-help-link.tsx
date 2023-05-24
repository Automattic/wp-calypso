import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { SUPPORT_FORUM } from '@automattic/help-center';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { ResponseCartMessage, useShoppingCart } from '@automattic/shopping-cart';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import AsyncLoad from 'calypso/components/async-load';
import HappychatButtonUnstyled from 'calypso/components/happychat/button';
import { ZendeskJetpackChat } from 'calypso/components/jetpack/jetpack-presales-chat-widget';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { useJpPresalesAvailabilityQuery } from 'calypso/lib/jetpack/use-jp-presales-availability-query';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSupportLevel from 'calypso/state/happychat/selectors/get-support-level';
import isPresalesZendeskChatAvailable from 'calypso/state/happychat/selectors/is-presales-zendesk-chat-available';
import { showInlineHelpPopover } from 'calypso/state/inline-help/actions';
import getSupportVariation from 'calypso/state/selectors/get-inline-help-support-variation';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
import { getSectionName } from 'calypso/state/ui/selectors';
import type { Theme } from '@automattic/composite-checkout';

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

export default function CheckoutHelpLink() {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	const { setShowHelpCenter } = useDataStoreDispatch( HELP_CENTER_STORE );
	const isEnglishLocale = useIsEnglishLocale();

	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	const cartErrors = responseCart.messages?.persistent_errors || [];
	const purchasesAreBlocked = cartErrors.some(
		( error: ResponseCartMessage ) => error.code === 'blocked'
	);

	const { presalesZendeskChatAvailable, section, supportVariationDetermined, supportVariation } =
		useSelector( ( state ) => {
			return {
				presalesZendeskChatAvailable: isPresalesZendeskChatAvailable( state ),
				section: getSectionName( state ),
				supportVariationDetermined: isSupportVariationDetermined( state ),
				supportVariation: getSupportVariation( state ),
			};
		} );
	const { data: isJpPresalesStaffed } = useJpPresalesAvailabilityQuery(
		presalesZendeskChatAvailable
	);

	const userAllowedToHelpCenter = config.isEnabled( 'calypso/help-center' );

	const handleHelpButtonClicked = () => {
		reduxDispatch( userAllowedToHelpCenter ? setShowHelpCenter( true ) : showInlineHelpPopover() );
		reduxDispatch(
			recordTracksEvent( 'calypso_checkout_composite_summary_help_click', {
				location: userAllowedToHelpCenter ? 'help-center' : 'inline-help-popover',
				section,
			} )
		);
	};

	const zendeskPresalesChatKey: string | false = config( 'zendesk_presales_chat_key' );
	const isPresalesZendeskChatEligible =
		presalesZendeskChatAvailable &&
		isEnglishLocale &&
		zendeskPresalesChatKey &&
		! purchasesAreBlocked;

	// Show loading button if we haven't determined whether or not to show the Zendesk chat button yet.
	const shouldShowLoadingButton =
		! supportVariationDetermined && ! isJpPresalesStaffed && ! isPresalesZendeskChatEligible;
	const isSitelessCheckout = isAkismetCheckout() || isJetpackCheckout();
	const shouldShowZendeskChatWidget =
		( isPresalesZendeskChatEligible && ! isSitelessCheckout ) ||
		( isSitelessCheckout && isJpPresalesStaffed );

	const hasDirectSupport = supportVariation !== SUPPORT_FORUM;

	// For the siteless checkouts, we do not need to specifically check if isJpPresalesStaffed is true
	// because if this function is being called during a siteless checkout session, shouldShowZendeskChatWidget
	// already ensures that isJpPresalesStaffed is true.
	const getZendeskChatWidget = () => {
		if ( isAkismetCheckout() ) {
			return <ZendeskJetpackChat keyType="akismet" />;
		}

		if ( isJetpackCheckout() ) {
			return <ZendeskJetpackChat keyType="jpCheckout" />;
		}

		// If we're not in a siteless checkout, we can use the regular wordpress themed Zendesk chat widget.
		return (
			<AsyncLoad
				require="calypso/components/presales-zendesk-chat"
				chatKey={ zendeskPresalesChatKey }
			/>
		);
	};

	// If pre-sales chat isn't available, use the inline help button instead.
	return (
		<CheckoutHelpLinkWrapper>
			<QuerySupportTypes />
			{ shouldShowLoadingButton && <LoadingButton /> }
			{ shouldShowZendeskChatWidget
				? getZendeskChatWidget()
				: supportVariationDetermined && (
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
