/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'calypso/components/banner';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';

const hideVoteBannerDate = new Date( '2020-11-03T23:59:59' );

const FollowingVoteBanner = ( props ) => {
	const now = new Date();
	const showRegistrationMsg = props.userInUS && now < hideVoteBannerDate;

	if ( ! showRegistrationMsg ) {
		return null;
	}

	return (
		<Banner
			className="following__reader-vote"
			title="Election Day: Tuesday 3rd November"
			callToAction="How to vote"
			description="Remember to vote."
			event="reader-vote-prompt"
			tracksImpressionName="calypso_reader_vote_banner_impression"
			tracksClickName="calypso_reader_vote_banner_click"
			href="https://www.usa.gov/how-to-vote"
			icon="star"
			horizontal
			target="_blank"
		/>
	);
};

export default connect( ( state ) => ( {
	userInUS: getCurrentUserCountryCode( state ) === 'US',
} ) )( FollowingVoteBanner );
