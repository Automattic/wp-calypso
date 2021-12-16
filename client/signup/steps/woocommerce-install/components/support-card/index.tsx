import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SupportLinkContainer = styled.p`
	@media ( max-width: 320px ) {
		margin-top: 0px;
		width: 100%;
	}
`;

const SupportLinkStyle = styled.a`
	/* Gray / Gray 100 - have to find the var value for this color */
	color: var( --studio-gray-100 ) !important;
	text-decoration: underline;
	font-weight: bold;
`;

export default function SupportCard(): ReactElement {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	return (
		<SupportLinkContainer>
			{ createInterpolateElement( __( 'Need help? <a>Contact support</a>' ), {
				a: (
					<SupportLinkStyle
						href={ addQueryArgs( '/help/contact', {
							redirect_to: `/start/woocommerce-install/confirm?site=${ domain }`,
						} ) }
					/>
				),
			} ) }
		</SupportLinkContainer>
	);
}
