import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useRef } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import CtaSection from 'calypso/components/cta-section';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import WarningCard from 'calypso/components/warning-card';
import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';
import WooCommerceColophon from '../woocommerce-colophon';

import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

interface Props {
	startSetup: () => void;
	siteId: number;
}

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
					{ __( 'Start a new store' ) }
				</Button>
			</FixedNavigationHeader>
			<CtaSection
				title={ __( 'Setup a store and start selling online' ) }
				headline={ __(
					'Set up a new store in minutes. Get secure payments, configurable shipping options, and more, out of the box.'
				) }
				notice={ renderWarningNotice() }
				cta={
					<>
						<Button
							href="https://wordpress.com/support/introduction-to-woocommerce/"
							ref={ ctaRef }
						>
							{ __( 'Learn more' ) }
						</Button>
						<Button
							primary
							onClick={ onCTAClickHandler }
							ref={ ctaRef }
							disabled={ isTransferringBlocked }
						>
							{ __( 'Start a new store' ) }
						</Button>
					</>
				}
				byline={ <WooCommerceColophon /> }
			/>
		</div>
	);
};

export default WoopLandingPage;
