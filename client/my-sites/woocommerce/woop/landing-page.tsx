import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
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
	const { __ } = useI18n();
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

	const upgradeButtonText = sprintf(
		/* translators: %s: The upgrading plan name (ex.: WordPress.com Business) */
		__( 'Upgrade to %s' ),
		upgradingPlan.product_name
	);

	const headlineText = isFeatureActive
		? __( 'Build exactly the eCommerce website you want.' )
		: sprintf(
				/* translators: %s: The upgrading plan name (ex.: WordPress.com Business) */
				__( 'Upgrade to the %s plan and set up your WooCommerce store.' ),
				upgradingPlan.product_name
		  );

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ onCTAHandler } primary>
					{ isFeatureActive ? __( 'Set up my store!' ) : upgradeButtonText }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ __( 'Have something to sell?' ) }
				headline={ headlineText }
				buttonText={ isFeatureActive ? __( 'Set up my store!' ) : upgradeButtonText }
				buttonAction={ onCTAHandler }
				ctaRef={ ctaRef }
			>
				<MasonryWave images={ images } />
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
