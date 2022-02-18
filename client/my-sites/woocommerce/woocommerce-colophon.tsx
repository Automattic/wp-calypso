import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import WooCommerceLogo from './woocommerce-logo';

export interface WooCommerceColophonProps {
	wpcomDomain: string;
}

function WooCommerceColophon( props: WooCommerceColophonProps ) {
	const translate = useTranslate();
	const { wpcomDomain } = props;
	const woocommercePluginURL = `/plugins/woocommerce/${ wpcomDomain }`;

	const onClick = () => {
		recordTracksEvent( 'calypso_woocommerce_woocommercecolophon_click' );
	};

	return (
		<div className="woocommerce-colophon">
			<a onClick={ onClick } href={ woocommercePluginURL }>
				{ translate( 'Powered by {{WooCommerceLogo /}}', {
					components: {
						WooCommerceLogo: <WooCommerceLogo />,
					},
				} ) }
			</a>
		</div>
	);
}

export default WooCommerceColophon;
