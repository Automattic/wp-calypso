/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import DismissibleCard from 'blocks/dismissible-card';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

export const WelcomeBanner = ( { translate, recordStats } ) => {
	return (
		<DismissibleCard
			className="customer-home__welcome-banner"
			preferenceName="home-welcome-banner-dismissed"
			onClick={ recordStats }
		>
			<img
				src="/calypso/images/extensions/woocommerce/woocommerce-setup.svg"
				aria-hidden="true"
				alt=""
			/>
			<div>
				<CardHeading>{ translate( 'Learn and grow with My Home' ) }</CardHeading>
				<p>
					{ translate(
						'This is your new home for quick links to common tasks, easy access to support, and guidance ' +
							'tailored to you. We’ll keep improving what you see here to help you learn and grow with us.'
					) }
				</p>
			</div>
		</DismissibleCard>
	);
};

export default connect( null, dispatch => ( {
	recordStats: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_home_welcome_banner_dismiss' ),
				bumpStat( 'calypso-home-welcome-banner', 'dismiss' )
			)
		),
} ) )( localize( WelcomeBanner ) );
