import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useRef } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import WarningCard from 'calypso/components/warning-card';
import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';
import WooCommerceColophon from './woocommerce-colophon';

import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

interface Props {
	startSetup: () => void;
	siteId: number;
}

const LandingPage: React.FunctionComponent< Props > = ( { siteId } ) => {
	const { __ } = useI18n();
	const navigationItems = [ { label: 'WooCommerce' } ];
	const ctaRef = useRef( null );

	const {
		isTransferringBlocked,
		wpcomDomain,
		isDataReady,
		currentUserEmail,
		isEmailVerified,
	} = useWooCommerceOnPlansEligibility( siteId );

	function onCTAClickHandler() {
		recordTracksEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: 'initial-setup',
			feature: 'woop', // WooCommerce on Plans
		} );

		return page( `/start/woocommerce-install/?site=${ wpcomDomain }` );
	}

	function renderWarningNotice() {
		if ( currentUserEmail && ! isEmailVerified ) {
			return (
				<WarningsOrHoldsSection>
					<WarningCard
						message={ sprintf(
							/* translators: %s: The user's primary email address (ex.: user@example.com) */
							__(
								"You need to confirm your email address before setting up a store. We've sent an email to %s with instructions for you to follow."
							),
							currentUserEmail
						) }
					/>
				</WarningsOrHoldsSection>
			);
		}

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
		<div className="landing-page">
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
				actionDisabled={ isTransferringBlocked || ! isEmailVerified }
				actionRef={ ctaRef }
				secondaryAction={
					<InlineSupportLink
						className="landing-page__learnmore empty-content__action button"
						supportContext="introduction-to-woocommerce"
						showIcon={ false }
					>
						{ __( 'Learn more' ) }
					</InlineSupportLink>
				}
				className="landing-page__empty-content"
			/>
			<WooCommerceColophon wpcomDomain={ wpcomDomain || '' } />
			<div className="landing-page__features-section">
				<FormattedHeader headerText={ __( 'Everything you need to create a successful store' ) } />
				<div className="landing-page__features">
					<PromoSection { ...promos } />
				</div>
			</div>
		</div>
	);
};

export default LandingPage;
