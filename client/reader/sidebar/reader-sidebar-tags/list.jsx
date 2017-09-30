/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity, map } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ReaderSidebarTagsListItem from './list-item';

export class ReaderSidebarTagsList extends Component {
	static propTypes = {
		tags: PropTypes.array,
		onUnfollow: PropTypes.func.isRequired,
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	renderItems = () => {
		const { path, onUnfollow, currentTag, tags } = this.props;
		return map( tags, function( tag ) {
			return (
				<ReaderSidebarTagsListItem
					key={ tag.id }
					tag={ tag }
					path={ path }
					onUnfollow={ onUnfollow }
					currentTag={ currentTag }
				/>
			);
		} );
	};

	render() {
		const { tags, translate } = this.props;
		if ( ! tags || tags.length === 0 ) {
			return (
				<li key="empty" className="sidebar__menu-empty">
					{ translate( 'Find relevant posts by adding a tag.' ) }
				</li>
			);
		}

		return <div>{ this.renderItems() }</div>;
	}
}

export default localize( ReaderSidebarTagsList );
