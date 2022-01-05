import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useRef } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import Image01 from 'calypso/assets/images/woocommerce/woop-cta-image01.jpeg';
import Image02 from 'calypso/assets/images/woocommerce/woop-cta-image02.jpeg';
import Image03 from 'calypso/assets/images/woocommerce/woop-cta-image03.jpeg';
import Image04 from 'calypso/assets/images/woocommerce/woop-cta-image04.jpeg';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MasonryWave from 'calypso/components/masonry-wave';
import WarningCard from 'calypso/components/warning-card';
import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';

import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

interface Props {
	startSetup: () => void;
	siteId: number;
}

const images = [ { src: Image01 }, { src: Image02 }, { src: Image03 }, { src: Image04 } ];

const WoopLandingPage: React.FunctionComponent< Props > = ( { siteId } ) => {
	const { __ } = useI18n();
	const navigationItems = [ { label: 'WooCommerce' } ];
	const ctaRef = useRef( null );

	const { isTransferringBlocked, wpcomDomain, isDataReady } = useWooCommerceOnPlansEligibility(
		siteId
	);

	function onCTAClickHandler() {
		recordTracksEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: 'initial-setup',
			feature: 'woop', // WooCommerce on Plans
		} );

		return page( `/start/woocommerce-install/?site=${ wpcomDomain }` );
	}

	function renderWarningNotice() {
		if ( ! isTransferringBlocked || ! isDataReady ) {
			return null;
		}

		return (
			<WarningsOrHoldsSection>
				<WarningCard
					message={ __(
						'There is an error that is stopping us from being able to install this product, please contact support.'
					) }
				/>
			</WarningsOrHoldsSection>
		);
	}

	return (
		<div className="woop__landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ onCTAClickHandler } primary disabled={ isTransferringBlocked }>
					{ __( 'Set up my store!' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ __( 'Have something to sell?' ) }
				headline={ __( 'Build exactly the eCommerce website you want.' ) }
				buttonText={ __( 'Set up my store!' ) }
				buttonAction={ onCTAClickHandler }
				buttonDisabled={ isTransferringBlocked }
				ctaRef={ ctaRef }
				notice={ renderWarningNotice() }
			>
				<MasonryWave images={ images } />
			</CtaSection>
		</div>
	);
};

export default WoopLandingPage;
