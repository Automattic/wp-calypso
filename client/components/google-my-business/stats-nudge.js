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
import DismissibleCard from 'blocks/dismissible-card';
import SectionHeader from 'components/section-header';

const GMBStatsNudge = ( { translate } ) => {
	return (
		<DismissibleCard
			className="google-my-business__stats-nudge"
			preferenceName="show-google-my-business-nudge"
			temporary
		>
			<SectionHeader
				className="google-my-business__stats-nudge-header"
				label={ translate( 'Recommendation from WordPress.com' ) }
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
					<h1 className="google-my-business__stats-nudge-title">
						{ translate( 'Reach more customers with Google My Business' ) }
					</h1>
					<h2 className="google-my-business__stats-nudge-description">
						{ translate(
							'Show up when customers search for businesses like yours on Google Search and Maps.'
						) }
					</h2>
					<div className="google-my-business__stats-nudge-button-row">
						<Button primary>{ translate( 'Start Now' ) }</Button>
						<Button>{ translate( "I've Already Listed" ) }</Button>
					</div>
				</div>
			</div>
		</DismissibleCard>
	);
};

export default localize( GMBStatsNudge );
