import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { sprintf, _x } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import PromoSection, { Props as PromoSectionProps } from 'calypso/components/promo-section';
import WarningCard from 'calypso/components/warning-card';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import useWooCommerceOnPlansEligibility from 'calypso/signup/steps/woocommerce-install/hooks/use-woop-handling';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
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
	line: string;
	action: string;
}

const LandingPage: React.FunctionComponent< Props > = ( { siteId } ) => {
	const { __ } = useI18n();
	const currentIntent = useSelector( ( state ) => getSiteOption( state, siteId, 'site_intent' ) );

	const dispatch = useDispatch();
	const sendEmailVerification = useSendEmailVerification();

	const { isTransferringBlocked, wpcomDomain, isDataReady, currentUserEmail, isEmailVerified } =
		useWooCommerceOnPlansEligibility( siteId );

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

	function changeEmailClickHandler() {
		page( '/me/account' );
	}

	async function resendVerificationEmail() {
		try {
			await sendEmailVerification();
			dispatch( successNotice( __( 'The verification email has been sent.' ) ) );
		} catch ( Error ) {
			dispatch(
				errorNotice( __( 'An error has occurred, please check your connection and retry.' ) )
			);
		}
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

	let secondaryAction = (
		<InlineSupportLink
			className="landing-page__learnmore empty-content__action button"
			supportContext="introduction-to-woocommerce"
			showIcon={ false }
		>
			{ __( 'Learn more' ) }
		</InlineSupportLink>
	);

	let finalCTAHandler = onCTAClickHandler;
	let displayData: DisplayData | null;

	if ( ! isEmailVerified ) {
		secondaryAction = (
			<Button
				className="landing-page__secondary empty-content__action"
				onClick={ changeEmailClickHandler }
			>
				Edit email address
			</Button>
		);

		finalCTAHandler = resendVerificationEmail;

		displayData = {
			title: _x( 'Verify your email address before setting up a store', 'Header text' ),
			line: sprintf(
				/* translators: %s: The unverified email */
				__(
					'A verification email has been sent to %s. Follow the link in the verification email to confirm that you can access your email account.'
				),
				currentUserEmail
			),
			action: _x( 'Resend verification email', 'Button text' ),
		};
	} else if ( currentIntent === 'sell' ) {
		displayData = {
			title: _x( 'Upgrade your store', 'Header text' ),
			line: __(
				'Need more out of your store? Unlock the tools needed to manage products, orders, shipping, and more.'
			),
			action: _x( 'Upgrade your store', 'Button text' ),
		};
	} else {
		displayData = {
			title: _x( 'Set up a store and start selling online', 'Header text' ),
			line: __(
				'Set up a new store in minutes. Get secure payments, configurable shipping options, and more, out of the box.'
			),
			action: _x( 'Start a new store', 'Button text' ),
		};
	}

	const { isAboveElement, targetRef: ctaRef, referenceRef: headerRef } = useScrollAboveElement();

	return (
		<div className="landing-page">
			<NavigationHeader navigationItems={ [] } title={ __( 'WooCommerce' ) } ref={ headerRef }>
				{ isAboveElement && (
					<Button onClick={ finalCTAHandler } primary disabled={ isTransferringBlocked }>
						{ displayData.action }
					</Button>
				) }
			</NavigationHeader>
			{ renderWarningNotice() }
			<EmptyContent
				title={ displayData.title }
				line={ displayData.line }
				action={ displayData.action }
				actionCallback={ finalCTAHandler }
				actionDisabled={ isTransferringBlocked }
				actionRef={ ctaRef }
				secondaryAction={ secondaryAction }
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
