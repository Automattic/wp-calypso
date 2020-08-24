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
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	renderItems() {
		const { path, currentTag, tags } = this.props;
		return map( tags, ( tag ) => (
			<ReaderSidebarTagsListItem
				key={ tag.id }
				tag={ tag }
				path={ path }
				currentTag={ currentTag }
			/>
		) );
	}

	render() {
		return <ul className="reader-sidebar-tags__list">{ this.renderItems() }</ul>;
	}
}

export default localize( ReaderSidebarTagsList );
