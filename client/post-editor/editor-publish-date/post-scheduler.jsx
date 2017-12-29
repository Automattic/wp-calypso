/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PostSchedule from 'components/post-schedule';
import QueryPosts from 'components/data/query-posts';
import { getOffsetDate, isPage } from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import { getPostsForQueryIgnoringPage } from 'state/posts/selectors';

const PostScheduleWithOtherPostsIndicated = connect( ( state, { site, query } ) => ( {
	posts: getPostsForQueryIgnoringPage( state, get( site, 'ID' ), query ) || [],
} ) )( function( { onDateChange, onMonthChange, posts, selectedDay, site } ) {
	return (
		<PostSchedule
			displayInputChrono={ false }
			selectedDay={ selectedDay }
			onDateChange={ onDateChange }
			onMonthChange={ onMonthChange }
			posts={ posts }
			site={ site }
		/>
	);
} );

export default class PostScheduler extends PureComponent {
	static propTypes = {
		initialDate: PropTypes.object.isRequired,
		post: PropTypes.object,
		setPostDate: PropTypes.func,
		site: PropTypes.object,
	};

	state = {
		firstDayOfTheMonth: this.getFirstDayOfTheMonth( this.props.initialDate ),
		lastDayOfTheMonth: this.getLastDayOfTheMonth( this.props.initialDate ),
	};

	getFirstDayOfTheMonth( date ) {
		const tz = siteUtils.timezone( this.props.site );

		return getOffsetDate( date, tz ).set( {
			year: date.year(),
			month: date.month(),
			date: 1,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0,
		} );
	}

	getLastDayOfTheMonth( date ) {
		return this.getFirstDayOfTheMonth( date )
			.add( 1, 'month' )
			.second( -1 );
	}

	setCurrentMonth = date => {
		this.setState( {
			firstDayOfTheMonth: this.getFirstDayOfTheMonth( date ),
			lastDayOfTheMonth: this.getLastDayOfTheMonth( date ),
		} );
	};

	render() {
		const { post, setPostDate, site } = this.props;
		const query = {
			status: 'publish,future',
			before: this.state.lastDayOfTheMonth.format(),
			after: this.state.firstDayOfTheMonth.format(),
			number: 100,
		};

		return (
			<div>
				{ ! isPage( post ) && <QueryPosts siteId={ get( site, 'ID' ) } query={ query } /> }
				<PostScheduleWithOtherPostsIndicated
					onDateChange={ setPostDate }
					onMonthChange={ this.setCurrentMonth }
					query={ query }
					selectedDay={ get( post, 'date' ) }
					site={ site }
				/>
			</div>
		);
	}
}
