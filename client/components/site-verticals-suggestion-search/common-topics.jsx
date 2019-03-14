/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

/*
	These topics are taken from the most popular for each segment.
*/
const COMMON_TOPICS = {
	business: [
		translate( 'Digital marketing' ),
		translate( 'Fitness & exercise' ),
		translate( 'Health Food' ),
		translate( 'Photography' ),
		translate( 'Real estate agency' ),
		translate( 'Restaurants' ),
		translate( 'Website designer' ),
	],
	blog: [
		translate( 'Education' ),
		translate( 'Fashion Designer' ),
		translate( 'Music' ),
		translate( 'Photography' ),
		translate( 'Sport' ),
		translate( 'Travel & Recreation' ),
		translate( 'Video Games' ),
	],
	professional: [
		translate( 'Artist' ),
		translate( 'Architecture' ),
		translate( 'College' ),
		translate( 'Computers' ),
		translate( 'Health & medical' ),
		translate( 'Photography' ),
		translate( 'Portfolio' ),
	],
	education: [
		translate( 'Architecture' ),
		translate( 'Education' ),
		translate( 'Higher Education & Academy' ),
		translate( 'Music' ),
		translate( 'Travel' ),
		translate( 'School' ),
		translate( 'Sports' ),
	],
};

class CommonTopics extends Component {
	static propTypes = {
		commonTopics: PropTypes.array.isRequired,
		onSelect: PropTypes.func.isRequired,
	};

	onClick = event => {
		event.preventDefault();
		event.stopPropagation();
		this.props.onSelect( event.currentTarget.value );
		this.props.recordTracksEvent( 'calypso_signup_common_site_vertical_clicked', {
			value: event.currentTarget.value,
		} );
	};
	render() {
		return (
			<div className="site-verticals-suggestion-search__common-topics">
				<div className="site-verticals-suggestion-search__heading">Common Topics</div>
				{ this.props.commonTopics.map( ( topic, index ) => (
					<button
						type="button"
						key={ index }
						value={ topic }
						className="site-verticals-suggestion-search__topic-list-item"
						onClick={ this.onClick }
						tabIndex="0"
					>
						{ topic }
					</button>
				) ) }
			</div>
		);
	}
}

export default connect(
	state => ( {
		commonTopics: COMMON_TOPICS[ getSiteType( state ) || 'blog' ],
	} ),
	{
		recordTracksEvent,
	}
)( CommonTopics );
