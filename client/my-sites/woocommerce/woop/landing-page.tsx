import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import './style.scss';
import Image01 from 'calypso/assets/images/woocommerce/woop-cta-image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/woop-cta-image02.jpeg';
import Image03 from 'calypso/assets/images/woocommerce/woop-cta-image03.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/woop-cta-image04.jpeg';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';
import { addQueryArgs } from 'calypso/lib/url';

interface Props {
	startSetup: () => void;
	isFeatureActive: boolean;
	upgradingPlan: Record< string, unknown >;
	siteSlug: string;
}

const images = [ { src: Image01 }, { src: Image02 }, { src: Image03 }, { src: Image04 } ];

const WoopLandingPage: React.FunctionComponent< Props > = ( {
	startSetup,
	siteSlug,
	isFeatureActive,
	upgradingPlan,
} ) => {
	const navigationItems = [ { label: 'WooCommerce', href: `/woocommerce-installation` } ];
	const ctaRef = useRef( null );

	function onCTAHandler() {
		if ( ! isFeatureActive && upgradingPlan?.product_slug ) {
			return ( window.location.href = addQueryArgs(
				{ redirect_to: window.location.href },
				`/checkout/${ siteSlug }/${ upgradingPlan.product_slug }`
			) );
		}

		startSetup();
	}

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ onCTAHandler } primary>
					{ isFeatureActive
						? translate( 'Set up my store!' )
						: translate( 'Upgrade to Premium plan' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ translate( 'Have something to sell?' ) }
				headline={
					isFeatureActive
						? translate( 'Build exactly the eCommerce website you want.' )
						: translate( 'Upgrade to the Premium plan and set up your WooCommerce store.' )
				}
				buttonText={
					isFeatureActive ? translate( 'Set up my store!' ) : translate( 'Upgrade to Premium plan' )
				}
				buttonAction={ onCTAHandler }
				ctaRef={ ctaRef }
			>
				<MasonryWave images={ images } />
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
