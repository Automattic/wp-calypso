import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import './style.scss';
import Image01 from 'calypso/assets/images/woocommerce/woop-cta-image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/woop-cta-image02.jpeg';
import Image03 from 'calypso/assets/images/woocommerce/woop-cta-image03.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/woop-cta-image04.jpeg';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';

interface Props {
	startSetup: () => void;
}

const images = [ { src: Image01 }, { src: Image02 }, { src: Image03 }, { src: Image04 } ];

const WoopLandingPage: React.FunctionComponent< Props > = ( { startSetup } ) => {
	const { __ } = useI18n();
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	const ctaRef = useRef( null );

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ startSetup } primary>
					{ __( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ __( 'Have something to sell?' ) }
				headline={ __( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ __( 'Set up my store!' ) }
				buttonAction={ startSetup }
				ctaRef={ ctaRef }
			>
				<MasonryWave images={ images } />
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
