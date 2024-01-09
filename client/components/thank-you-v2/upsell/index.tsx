import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import blueMeshDesktopImg from 'calypso/assets/images/thank-you-upsell/mesh-blue-desktop.png';
import blueMeshMobileImg from 'calypso/assets/images/thank-you-upsell/mesh-blue-mobile.png';
import bluegreenMeshDesktopImg from 'calypso/assets/images/thank-you-upsell/mesh-bluegreen-desktop.png';
import bluegreenMeshMobileImg from 'calypso/assets/images/thank-you-upsell/mesh-bluegreen-mobile.png';
import pinkMeshDesktopImg from 'calypso/assets/images/thank-you-upsell/mesh-pink-desktop.png';
import pinkMeshMobileImg from 'calypso/assets/images/thank-you-upsell/mesh-pink-mobile.png';
import purpleMeshDesktopImg from 'calypso/assets/images/thank-you-upsell/mesh-purple-desktop.png';
import purpleMeshMobileImg from 'calypso/assets/images/thank-you-upsell/mesh-purple-mobile.png';

import './style.scss';

const validMeshColors = {
	blue: {
		desktop: blueMeshDesktopImg,
		mobile: blueMeshMobileImg,
	},
	bluegreen: {
		desktop: bluegreenMeshDesktopImg,
		mobile: bluegreenMeshMobileImg,
	},
	pink: {
		desktop: pinkMeshDesktopImg,
		mobile: pinkMeshMobileImg,
	},
	purple: {
		desktop: purpleMeshDesktopImg,
		mobile: purpleMeshMobileImg,
	},
};

type MeshColor = keyof typeof validMeshColors;

export type ThankYouUpsellProps = {
	title: string;
	description: string;
	icon: string;
	meshColor?: MeshColor;
	action?: React.ReactNode;
};

const ContentDiv = styled( 'div' )< { meshColor: MeshColor } >`
	background-repeat: no-repeat;
	background-position-x: -54px;
	background-size: 100px 100%;
	background-image: url( '${ ( props ) =>
		props.meshColor && validMeshColors[ props.meshColor ]
			? validMeshColors[ props.meshColor ].desktop
			: validMeshColors.blue.desktop }' );
	@media (max-width: 480px ) {
		background-position-y: -54px;
		background-position-x: unset;
		background-size: 100% 100px;
		background-image: url( '${ ( props ) =>
			props.meshColor && validMeshColors[ props.meshColor ]
				? validMeshColors[ props.meshColor ].mobile
				: validMeshColors.blue.mobile }' );

`;

const ThankYouUpsell = ( {
	title,
	description,
	icon,
	meshColor = 'blue',
	action,
}: ThankYouUpsellProps ) => {
	return (
		<div className="checkout-thank-you__upsell">
			<div className="checkout-thank-you__upsell-title">
				{ translate( 'This might interest you' ) }
			</div>
			<ContentDiv className="checkout-thank-you__upsell-content" meshColor={ meshColor }>
				<div className="checkout-thank-you__upsell-content-details">
					<div className="checkout-thank-you__upsell-content-details-image">
						<div className="checkout-thank-you__upsell-content-details-image-content">
							<img className="checkout-thank-you__upsell-image-content-icon" alt="" src={ icon } />
						</div>
					</div>
					<div className="checkout-thank-you__upsell-content-text">
						<h3 className="checkout-thank-you__upsell-content-text-title">{ title }</h3>
						<div className="checkout-thank-you__upsell-content-text-description">
							{ description }
						</div>
					</div>
				</div>
				<div className="checkout-thank-you__upsell-content-actions">{ action }</div>
			</ContentDiv>
		</div>
	);
};

export default ThankYouUpsell;
