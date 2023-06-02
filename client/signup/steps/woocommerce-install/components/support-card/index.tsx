import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useSelector } from 'calypso/state';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SupportLinkContainer = styled.p`
	@media ( max-width: 320px ) {
		margin-top: 0px;
		width: 100%;
	}
`;

const SupportLinkStyle = styled.a`
	color: var( --studio-gray-100 ) !important;
	text-decoration: underline;
	font-weight: bold;
`;

export default function SupportCard( { backUrl }: { backUrl?: string } ) {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	return (
		<SupportLinkContainer>
			{ createInterpolateElement( __( 'Need help? <a>Contact support</a>' ), {
				a: (
					<SupportLinkStyle
						href={ addQueryArgs( '/help/contact', {
							redirect_to: backUrl || `${ window.location.pathname }?siteSlug=${ domain }`,
						} ) }
					/>
				),
			} ) }
		</SupportLinkContainer>
	);
}
