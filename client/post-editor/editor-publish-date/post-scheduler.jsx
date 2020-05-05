/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import moment from 'moment-timezone';

/**
 * Internal dependencies
 */
import PostSchedule from 'components/post-schedule';
import QueryPosts from 'components/data/query-posts';
import * as postUtils from 'state/posts/utils';
import { timezone, gmtOffset } from 'lib/site/utils';
import { getPostsForQueryIgnoringPage } from 'state/posts/selectors';

const PostScheduleWithOtherPostsIndicated = connect( ( state, { site, query } ) => ( {
	posts: getPostsForQueryIgnoringPage( state, get( site, 'ID' ), query ) || [],
} ) )( function ( { onDateChange, onMonthChange, posts, selectedDay, site } ) {
	return (
		<PostSchedule
			displayInputChrono={ false }
			selectedDay={ selectedDay }
			onDateChange={ onDateChange }
			onMonthChange={ onMonthChange }
			posts={ posts }
			site={ site }
			timezone={ timezone( site ) }
			gmtOffset={ gmtOffset( site ) }
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

	state = this.getFirstAndLastDayOfTheMonth( this.props.initialDate );

	// Calculates the start and end of the period shown by a monthly calendar UI
	// for the specified `date`:
	// - first day of the week containing the first day of the month
	// - last day of the week containing the last day of the month
	getFirstAndLastDayOfTheMonth( date ) {
		const tz = timezone( this.props.site );
		const tzDate = tz ? moment.tz( date, tz ) : moment( date );

		return {
			firstDayOfTheMonth: tzDate.clone().startOf( 'month' ).startOf( 'week' ),
			lastDayOfTheMonth: tzDate.clone().endOf( 'month' ).endOf( 'week' ),
		};
	}

	setCurrentMonth = ( date ) => {
		this.setState( this.getFirstAndLastDayOfTheMonth( date ) );
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
			<Fragment>
				{ ! postUtils.isPage( post ) && (
					<QueryPosts siteId={ get( site, 'ID' ) } query={ query } />
				) }
				<PostScheduleWithOtherPostsIndicated
					onDateChange={ setPostDate }
					onMonthChange={ this.setCurrentMonth }
					query={ query }
					selectedDay={ get( post, 'date' ) }
					site={ site }
				/>
			</Fragment>
		);
	}
}
