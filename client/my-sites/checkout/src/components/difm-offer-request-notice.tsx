import styled from '@emotion/styled';
import { Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { hasDIFMOfferPlan } from 'calypso/lib/cart-values/cart-items';
import type { ResponseCart } from '@automattic/shopping-cart';

const RequestNotice = styled( Notice )`
	margin: 0 0 24px;
`;

export default function DIFMOfferRequestNotice( { responseCart }: { responseCart: ResponseCart } ) {
	const translate = useTranslate();
	const [ isDismissed, setIsDismissed ] = useState( false );

	if ( isDismissed || ! hasDIFMOfferPlan( responseCart ) ) {
		return null;
	}

	return (
		<RequestNotice status="success" onRemove={ () => setIsDismissed( true ) }>
			{ translate(
				"Thank you for submitting your request. After you complete checkout, we'll be in touch within 24 hours to discuss your project."
			) }
		</RequestNotice>
	);
}
