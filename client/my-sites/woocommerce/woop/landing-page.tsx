import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import { useSelector } from 'react-redux';
import Image01 from 'calypso/assets/images/woocommerce/woop-cta-image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/woop-cta-image02.jpeg';
import Image03 from 'calypso/assets/images/woocommerce/woop-cta-image03.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/woop-cta-image04.jpeg';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';
import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

import './style.scss';

interface Props {
	startSetup: () => void;
	siteId: number;
}

const images = [ { src: Image01 }, { src: Image02 }, { src: Image03 }, { src: Image04 } ];

const WoopLandingPage: React.FunctionComponent< Props > = ( { startSetup, siteId } ) => {
	const { __ } = useI18n();
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	const ctaRef = useRef( null );

	const { isFetching, hasBlockers, wpcomDomain } = useWooCommerceOnPlansEligibility( siteId );
	const isAtomic = !! useSelector( ( state ) => isAtomicSite( state, siteId ) );

	function onCTAClickHandler() {
		if ( ! isAtomic ) {
			return page( `/start/woocommerce-install/?site=${ wpcomDomain }` );
		}

		return startSetup();
	}

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ onCTAClickHandler } primary disabled={ hasBlockers }>
					{ __( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ __( 'Have something to sell?' ) }
				headline={ __( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ __( 'Set up my store!' ) }
				buttonAction={ onCTAClickHandler }
				buttonDisabled={ isFetching || hasBlockers }
				ctaRef={ ctaRef }
			>
				<MasonryWave images={ images } />
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
