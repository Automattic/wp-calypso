/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import QueryPosts from 'components/data/query-posts';
import postUtils from 'lib/posts/utils';
import siteUtils from 'lib/site/utils';
import { getSitePostsForQueryIgnoringPage } from 'state/posts/selectors';

const PostSchedule = ( { onDateChange, onMonthChange, posts, selectedDay, site } ) => {
	const tz = siteUtils.timezone( site );
	const gmtOffset = siteUtils.gmtOffset( site );

	return (
		<AsyncLoad
			require="components/post-schedule"
			selectedDay={ selectedDay }
			timezone={ tz }
			gmtOffset={ gmtOffset }
			onDateChange={ onDateChange }
			onMonthChange={ onMonthChange }
			posts={ posts }
			site={ site }
		/>
	);
};

const ConnectedPostSchedule = connect(
	( state, { site, query } ) => ( {
		posts: getSitePostsForQueryIgnoringPage( state, get( site, 'ID' ), query ) || [],
	} )
)( PostSchedule );

export default class PostScheduler extends PureComponent {
	static propTypes = {
		initialDate: PropTypes.object.isRequired,
		post: PropTypes.object,
		setPostDate: PropTypes.func,
		site: PropTypes.object,
	}

	state = {
		firstDayOfTheMonth: this.getFirstDayOfTheMonth( this.props.initialDate ),
		lastDayOfTheMonth: this.getLastDayOfTheMonth( this.props.initialDate ),
	}

	getFirstDayOfTheMonth( date ) {
		const tz = siteUtils.timezone( this.props.site );

		return postUtils.getOffsetDate( date, tz ).set( {
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

	setCurrentMonth = ( date ) => {
		this.setState( {
			firstDayOfTheMonth: this.getFirstDayOfTheMonth( date ),
			lastDayOfTheMonth: this.getLastDayOfTheMonth( date )
		} );
	}

	render() {
		const { post, setPostDate, site } = this.props;
		const query = {
			status: 'publish,future',
			before: this.state.lastDayOfTheMonth.format(),
			after: this.state.firstDayOfTheMonth.format(),
			number: 100,
		};

		return (
			<span className="editor-publish-date__post-scheduler">
				{ ! postUtils.isPage( post ) && <QueryPosts
					siteId={ get( site, 'ID' ) }
					query={ query } /> }
				<ConnectedPostSchedule
					require="components/post-schedule"
					onDateChange={ setPostDate }
					onMonthChange={ this.setCurrentMonth }
					query={ query }
					selectedDay={ get( post, 'date' ) }
					site={ site }
				/>
			</span>
		);
	}
}
