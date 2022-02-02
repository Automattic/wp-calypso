import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useRef } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
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

	const promos: PromoSectionProps = {
		promos: [
			{
				title: __( 'Run Your Store From Anywhere' ),
				body: __(
					'Manage your business on the go with the WooCommerce Mobile App. Create products, process orders, and keep an eye on key stats in real-time.'
				),
				image: <Gridicon icon="globe" />,
			},
			{
				title: __( 'Learn With a Global Community' ),
				body: __( 'WooCommerce is one of the fastest-growing eCommerce communities.' ),
				image: <Gridicon icon="user-circle" />,
			},
			{
				title: __( 'Customize and Extend' ),
				body: __(
					'From subscriptions to gym classes to luxury cars, WooCommerce is fully customizable.'
				),
				image: <Gridicon icon="story" />,
			},
		],
	};

	return (
		<div className="woop__landing-page woocommerce_landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ onCTAClickHandler } primary disabled={ isTransferringBlocked }>
					{ __( 'Start a new store' ) }
				</Button>
			</FixedNavigationHeader>
			{ renderWarningNotice() }
			<EmptyContent
				title={ __( 'Set up a store and start selling online' ) }
				illustration="/calypso/images/illustrations/illustration-shopping-bags.svg"
				illustrationWidth={ 150 }
				line={ __(
					'Set up a new store in minutes. Get secure payments, configurable shipping options, and more, out of the box.'
				) }
				action={ __( 'Start a new store' ) }
				actionCallback={ onCTAClickHandler }
				actionDisabled={ isTransferringBlocked }
				actionRef={ ctaRef }
				secondaryAction={ __( 'Learn more' ) }
				secondaryActionURL="https://wordpress.com/support/introduction-to-woocommerce/"
				secondaryActionTarget="_blank"
				className="woop__landing-page-cta woocommerce_landing-page-empty-content"
			/>
			<WooCommerceColophon wpcomDomain={ wpcomDomain || '' } />
			<div className="woop__landing-page-features-section">
				<FormattedHeader headerText={ __( 'Everything you need to create a successful store' ) } />
				<div className="woop__landing-page-features">
					<PromoSection { ...promos } />
				</div>
			</div>
		</div>
	);
};

export default WoopLandingPage;
