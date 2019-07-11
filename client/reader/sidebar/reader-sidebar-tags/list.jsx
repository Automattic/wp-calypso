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
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	renderItems = () => {
		const { path, currentTag, tags } = this.props;
		return map( tags, function( tag ) {
			return (
				<ReaderSidebarTagsListItem
					key={ tag.id }
					tag={ tag }
					path={ path }
					currentTag={ currentTag }
				/>
			);
		} );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return <ul className="sidebar__tags-list">{ this.renderItems() }</ul>;
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ReaderSidebarTagsList );
