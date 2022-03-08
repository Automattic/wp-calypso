import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useRef } from '@wordpress/element';
import { sprintf, _x } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import page from 'page';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import WarningCard from 'calypso/components/warning-card';
import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';
import { useIsSimpleSeller } from 'calypso/state/sites/hooks';
import WooCommerceColophon from './woocommerce-colophon';

import './style.scss';

const WarningsOrHoldsSection = styled.div`
	margin-bottom: 40px;
`;

interface Props {
	startSetup: () => void;
	siteId: number;
}

interface DisplayData {
	title: string;
	illustration: string;
	line: string;
	action: string;
}

const LandingPage: React.FunctionComponent< Props > = ( { siteId } ) => {
	const { __ } = useI18n();
	const navigationItems = [ { label: 'WooCommerce' } ];
	const ctaRef = useRef( null );
	const simpleSeller = useIsSimpleSeller();

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

		return page(
			addQueryArgs( '/start/woocommerce-install', {
				back_to: `/woocommerce-installation/${ wpcomDomain }`,
				siteSlug: wpcomDomain,
			} )
		);
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
				title: (
					<>
						<Gridicon icon="globe" />
						{ __( 'Run Your Store From Anywhere' ) }
					</>
				),
				body: __(
					'Manage your business on the go with the WooCommerce Mobile App. Create products, process orders, and keep an eye on key stats in real-time.'
				),
			},
			{
				title: (
					<>
						<Gridicon icon="user-circle" />
						{ __( 'Learn With a Global Community' ) }
					</>
				),
				body: __( 'WooCommerce is one of the fastest-growing eCommerce communities.' ),
			},
			{
				title: (
					<>
						<Gridicon icon="story" />
						{ __( 'Customize and Extend' ) }
					</>
				),
				body: __(
					'From subscriptions to gym classes to luxury cars, WooCommerce is fully customizable.'
				),
			},
		],
	};

	let displayData: DisplayData | null;

	if ( simpleSeller ) {
		displayData = {
			title: _x( 'Upgrade your store', 'Header text' ),
			illustration: '/calypso/images/illustrations/illustration-seller.svg',
			line: __(
				'Need more out of your store? Unlock the tools needed to manage products, orders, shipping, and more.'
			),
			action: _x( 'Upgrade your store', 'Button text' ),
		};
	} else {
		displayData = {
			title: _x( 'Set up a store and start selling online', 'Header text' ),
			illustration: '/calypso/images/illustrations/illustration-shopping-bags.svg',
			line: __(
				'Set up a new store in minutes. Get secure payments, configurable shipping options, and more, out of the box.'
			),
			action: _x( 'Start a new store', 'Button text' ),
		};
	}

	return (
		<div className="landing-page">
			<FixedNavigationHeader navigationItems={ navigationItems } contentRef={ ctaRef }>
				<Button onClick={ onCTAClickHandler } primary disabled={ isTransferringBlocked }>
					{ displayData.action }
				</Button>
			</FixedNavigationHeader>
			{ renderWarningNotice() }
			<EmptyContent
				title={ displayData.title }
				illustration={ displayData.illustration }
				illustrationWidth={ 150 }
				line={ displayData.line }
				action={ displayData.action }
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
