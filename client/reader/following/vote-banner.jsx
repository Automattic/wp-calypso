/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { sample } from 'lodash';

/**
 * Internal dependencies
 */
import Banner from 'calypso/components/banner';
import { getCurrentUserCountryCode } from 'calypso/state/current-user/selectors';

const electionDayStart = new Date( '2020-11-03T00:00:00' );
const electionDayEnd = new Date( '2020-11-03T23:59:59' );
const earlyVotingMessage = 'Early voting is open now in most states.';
const electionDayMessages = [
	'Remember to vote.',
	"Don't forget to vote.",
	'Make your voice heard!',
	'Your vote is important.',
	'Your participation is important.',
	'Make a plan to vote.',
	'Do you have a plan to vote?',
];

const FollowingVoteBanner = ( props ) => {
	const now = new Date();
	const showRegistrationMsg = props.userInUS && now < electionDayEnd;

	if ( ! showRegistrationMsg ) {
		return null;
	}

	// Show the early voting message if it's not election day yet
	const electionDayMessage = sample( electionDayMessages );
	const description = now < electionDayStart ? earlyVotingMessage : electionDayMessage;

	return (
		<Banner
			className="following__reader-vote"
			title="Election Day: Tuesday, November 3"
			callToAction="How to vote"
			description={ description }
			event="reader-vote-prompt"
			tracksImpressionName="calypso_reader_vote_banner_impression"
			tracksClickName="calypso_reader_vote_banner_click"
			href="https://www.vote.org"
			icon="star"
			horizontal
			target="_blank"
		/>
	);
};

export default connect( ( state ) => ( {
	userInUS: getCurrentUserCountryCode( state ) === 'US',
} ) )( FollowingVoteBanner );
