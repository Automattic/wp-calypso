import { Button } from '@automattic/components';
import { useRef } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import './style.scss';
import { useSelector } from 'react-redux';
import Image01 from 'calypso/assets/images/woocommerce/woop-cta-image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/woop-cta-image02.jpeg';
import Image03 from 'calypso/assets/images/woocommerce/woop-cta-image03.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/woop-cta-image04.jpeg';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';
import { addQueryArgs } from 'calypso/lib/url';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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

	const siteId = useSelector( getSelectedSiteId ) as number;
	const isAtomic = !! useSelector( ( state ) => isAtomicSite( state, siteId ) );

	function onCTAHandler() {
		if ( ! isFeatureActive && upgradingPlan?.product_slug ) {
			return ( window.location.href = addQueryArgs(
				{ redirect_to: `/start/woocommerce-install/?site=${ siteSlug }` },
				`/checkout/${ siteSlug }/business`
			) );
		}

		if ( ! isAtomic ) {
			return ( window.location.href = `/start/woocommerce-install/?site=${ siteSlug }` );
		}

		startSetup();
	}

	const upgradeButtonText = upgradingPlan.product_name
		? sprintf(
				/* translators: %s: The upgrading plan name (ex.: WordPress.com Business) */
				__( 'Upgrade to %s' ),
				upgradingPlan.product_name
		  )
		: __( 'Upgrade' );

	let headlineText;

	if ( isFeatureActive ) {
		headlineText = __( 'Build exactly the eCommerce website you want.' );
	} else {
		headlineText = upgradingPlan.product_name
			? sprintf(
					/* translators: %s: The upgrading plan name (ex.: WordPress.com Business) */
					__( 'Upgrade to the %s plan and set up your WooCommerce store.' ),
					upgradingPlan.product_name
			  )
			: __( 'Upgrade to set up your WooCommerce store.' );
	}

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
