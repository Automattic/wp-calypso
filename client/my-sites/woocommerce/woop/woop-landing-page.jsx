import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import Image01 from 'calypso/assets/images/woocommerce/image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/image02.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/image04.jpeg';
import Image05 from 'calypso/assets/images/woocommerce/image05.jpeg';
import CtaHeader from 'calypso/components/cta-header';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';
import './style.scss';

const images = [ { src: Image01 }, { src: Image05 }, { src: Image02 }, { src: Image04 } ];

const WoopLandingPage = ( props ) => {
	const { startSetup } = props;
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	return (
		<div className="woop-landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems }>
				<Button onClick={ startSetup } primary>
					{ translate( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaHeader
				title={ translate( 'Have something to sell?' ) }
				subtitle={ translate( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ translate( 'Set up my store!' ) }
				buttonAction={ startSetup }
			>
				<MasonryWave images={ images } />
			</CtaHeader>
		</div>
	);
};

export default WoopLandingPage;
