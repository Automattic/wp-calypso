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
import ReaderSidebarBlogsListItem from './list-item';

export class ReaderSidebarBlogsList extends Component {
	static propTypes = {
		unseen: PropTypes.obj,
		blogs: PropTypes.array,
		path: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	renderItems() {
		const { path, blogs, unseen } = this.props;
		return map( blogs, ( blog ) => (
			<ReaderSidebarBlogsListItem
				key={ blog.ID }
				path={ path }
				blog={ blog }
				hasUnseen={ unseen && unseen.subsections && unseen.subsections[ blog.ID ] }
			/>
		) );
	}

	render() {
		return <ul className="reader-sidebar-blogs__list">{ this.renderItems() }</ul>;
	}
}

export default localize( ReaderSidebarBlogsList );
