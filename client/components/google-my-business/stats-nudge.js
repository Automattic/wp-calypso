/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
// import Card from 'components/card';
import DismissibleCard from 'blocks/dismissible-card';
import SectionHeader from 'components/section-header';

const StatsNudge = ( { translate } ) => {
	return (
		<DismissibleCard
			className="google-my-business__stats-nudge"
			preferenceName="show-google-my-business-nudge"
			temporary
		>
			<SectionHeader
				className="google-my-business__stats-nudge-header"
				label={ translate( 'We recommend Google My Business' ) }
			/>
			<div className="google-my-business__stats-nudge-body">
				<div className="google-my-business__stats-nudge-image-wrapper">
					<img
						className="google-my-business__stats-nudge-image"
						src="/calypso/images/google-my-business/phone-screenshot.png"
						alt={ translate( 'Your business with Google My Business' ) }
					/>
				</div>
				<div className="google-my-business__stats-nudge-info">
					<h1 className="google-my-business__stats-nudge-heading">
						{ translate( 'Is your business listed on Google?' ) }
					</h1>
					<h2 className="google-my-business__stats-nudge-description">
						{ translate(
							'Google My Business is a fast and free way to drive traffic to your local business.'
						) }
					</h2>
					<div className="google-my-business__stats-nudge-button-row">
						<Button primary>{ translate( 'Drive More Traffic' ) }</Button>
						<Button>{ translate( 'Not Now' ) }</Button>
					</div>
				</div>
			</div>
		</DismissibleCard>
	);
};

export default localize( StatsNudge );
