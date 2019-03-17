/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
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
const POPULAR_TOPICS = {
	business: [
		translate( 'Travel Agency' ),
		translate( 'Digital Marketing' ),
		translate( 'Fashion Designer' ),
		translate( 'Website Designer' ),
		translate( 'Real Estate Agent' ),
		translate( 'Cameras & Photography' ),
		translate( 'Restaurants' ),
	],
	blog: [
		translate( 'Travel' ),
		translate( 'Fashion' ),
		translate( 'Education' ),
		translate( 'Food' ),
		translate( 'Music' ),
		translate( 'Photography' ),
		translate( 'Sports' ),
	],
	professional: [
		translate( 'Education' ),
		translate( 'Higher Education & Academy' ),
		translate( 'Travel' ),
		translate( 'School' ),
		translate( 'Website Designer' ),
		translate( 'Fashion' ),
		translate( 'Portfolio' ),
	],
	education: [
		translate( 'Higher Education & Academy' ),
		translate( 'Fashion' ),
		translate( 'School' ),
		translate( 'Website Designer' ),
		translate( 'Travel' ),
		translate( 'Design' ),
		translate( 'Adult Education School' ),
	],
};

class PopularTopics extends PureComponent {
	static propTypes = {
		popularTopics: PropTypes.array.isRequired,
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
				<div className="site-verticals-suggestion-search__heading">{ translate( 'Popular' ) }</div>
				{ this.props.popularTopics.map( ( topic, index ) => (
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
		popularTopics: POPULAR_TOPICS[ getSiteType( state ) || 'blog' ],
	} ),
	{
		recordTracksEvent,
	}
)( PopularTopics );
