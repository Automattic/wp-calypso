import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

const Notice = styled.p`
	margin: 0 auto;
	padding: 24px;
	text-align: center;
	font-size: 13px;
	color: ${ ( props ) => props.theme.colors.textColorLight };
	max-width: 1280px;
	box-sizing: border-box;
	white-space: pre-line;
`;

// Legal disclosure; must not be translated. The en-dashes (U+2013) are intentional.
// The newline between "Inc." and "60" renders as a line break via the
// `white-space: pre-line` rule on Notice above.
const PROCESSOR_ADDRESS =
	'Automattic Inc.\n60 29th Street #343 – San Francisco, CA 94110 – United States of America';

export default function CheckoutProcessorNotice() {
	const translate = useTranslate();
	return (
		<Notice className="checkout-processor-notice">
			{ translate( 'Your payment will be processed by %(address)s', {
				args: { address: PROCESSOR_ADDRESS },
				comment:
					'Legal disclosure shown below the checkout form. The %(address)s placeholder is a company name and street address; do not translate it.',
			} ) }
		</Notice>
	);
}
