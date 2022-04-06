import styled from '@emotion/styled';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { ReactElement } from 'react';

const SupportLinkContainer = styled.p`
	@media ( max-width: 320px ) {
		margin-top: 0px;
		width: 100%;
	}

	margin-bottom: 1rem;
`;

const SupportLinkStyle = styled.a`
	color: var( --studio-gray-100 ) !important;
	text-decoration: underline;
	font-weight: bold;
`;

export default function SupportCard( {
	domain,
	backUrl,
}: {
	domain: string;
	backUrl?: string;
} ): ReactElement {
	domain = domain?.replace( /http[s]*:\/\//, '' );

	return (
		<SupportLinkContainer>
			{ createInterpolateElement( __( 'Need help? <a>Contact support</a>' ), {
				a: (
					<SupportLinkStyle
						href={ addQueryArgs( '/help/contact', {
							redirect_to: backUrl || `${ window.location.pathname }?siteSlug=${ domain }`,
						} ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			} ) }
		</SupportLinkContainer>
	);
}
