/**
 * External Dependencies
 */
import React from 'react';
import map from 'lodash/collection/map';

/**
 * Internal Dependencies
 */
import ReaderSidebarTagsListItem from './list-item';

const ReaderSidebarTagsList = React.createClass( {

	propTypes: {
		tags: React.PropTypes.array,
		onUnfollow: React.PropTypes.func.isRequired,
		path: React.PropTypes.string.isRequired,
		currentTag: React.PropTypes.string
	},

	renderItems() {
		return map( this.props.tags, function( tag ) {
			return (
				<ReaderSidebarTagsListItem
					key={ tag.ID }
					tag={ tag }
					path={ this.props.path }
					onUnfollow={ this.props.onUnfollow }
					currentTag={ this.props.currentTag } />
			);
		}, this );
	},

	render() {
		if ( ! this.props.tags || this.props.tags.length === 0 ) {
			return (
				<li key="empty" className="sidebar__menu-empty">{ this.translate( 'Find relevant posts by adding a\xa0tag.' ) }</li>
			);
		}

		return(
			<div>{ this.renderItems() }</div>
		);
	}
} );

export default ReaderSidebarTagsList;
