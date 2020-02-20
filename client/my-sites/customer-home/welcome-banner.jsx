/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { Card, Button } from '@automattic/components';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { savePreference } from 'state/preferences/actions';
import QueryPreferences from 'components/data/query-preferences';
import { isFetchingPreferences, getPreference } from 'state/preferences/selectors';

export const WelcomeBanner = ( {
	translate,
	fetchingPreferences,
	bannerDismissed,
	dismissBanner,
} ) => {
	return (
		<>
			<QueryPreferences />
			{ ! fetchingPreferences && ! bannerDismissed && (
				<div className="customer-home__welcome-banner">
					<Card>
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
							<Button onClick={ dismissBanner }>{ translate( 'Got it!' ) }</Button>
						</div>
					</Card>
				</div>
			) }
		</>
	);
};

export default connect(
	state => ( {
		bannerDismissed: getPreference( state, 'home-welcome-banner-dismissed' ),
		fetchingPreferences: isFetchingPreferences( state ),
	} ),
	dispatch => ( {
		dismissBanner: () =>
			dispatch(
				withAnalytics(
					composeAnalytics(
						recordTracksEvent( 'calypso_home_welcome_banner_dismiss' ),
						bumpStat( 'calypso-home-welcome-banner', 'dismiss' )
					),
					savePreference( 'home-welcome-banner-dismissed', true )
				)
			),
	} )
)( localize( WelcomeBanner ) );
