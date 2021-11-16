import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import './style.scss';
import Image01 from 'calypso/assets/images/woocommerce/image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/image02.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/image04.jpeg';
import Image05 from 'calypso/assets/images/woocommerce/image05.jpeg';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';

interface Props {
	startSetup: () => void;
}

const images = [ { src: Image01 }, { src: Image05 }, { src: Image02 }, { src: Image04 } ];

const WoopLandingPage: React.FunctionComponent< Props > = ( props ) => {
	const { startSetup } = props;
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	const ctaRef = useRef( null );

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ startSetup } primary>
					{ translate( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ translate( 'Have something to sell?' ) }
				headline={ translate( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ translate( 'Set up my store!' ) }
				buttonAction={ startSetup }
				ctaRef={ ctaRef }
			>
				<MasonryWave images={ images } />
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
