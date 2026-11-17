import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useValidCheckoutBackUrl from '../hooks/use-valid-checkout-back-url';
import { leaveCheckout } from '../lib/leave-checkout';

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	margin-block-start: 8px;
`;

/**
 * Leaves checkout for its `checkoutBackUrl` and keeps the cart, for flows that ask for it with
 * `pay_later=1`.
 */
export default function CheckoutPayLaterButton() {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug ) ?? undefined;
	const queryArgs = useSelector( getInitialQueryArguments ) ?? {};
	const backUrl = useValidCheckoutBackUrl( siteSlug );

	if ( queryArgs.pay_later !== '1' || ! backUrl ) {
		return null;
	}

	return (
		<Wrapper>
			<Button
				__next40pxDefaultSize
				variant="secondary"
				onClick={ () =>
					leaveCheckout( {
						siteSlug,
						forceCheckoutBackUrl: backUrl,
						tracksEvent: 'calypso_checkout_pay_later_clicked',
					} )
				}
			>
				{ translate( 'Pay later', {
					comment: 'A button that leaves checkout and keeps the items in the cart for later.',
				} ) }
			</Button>
		</Wrapper>
	);
}
