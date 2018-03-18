/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ExpandableSidebarMenu from '../expandable';
import ReaderSidebarListsList from './list';

export class ReaderSidebarLists extends Component {
	static propTypes = {
		lists: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	render() {
		const { translate, lists, isOpen, onClick } = this.props;
		const listCount = lists ? lists.length : 0;
		return (
			<ExpandableSidebarMenu
				expanded={ isOpen }
				title={ translate( 'Lists' ) }
				count={ listCount }
				onClick={ onClick }
				hideAddButton={ true }
			>
				<ReaderSidebarListsList { ...this.props } />
			</ExpandableSidebarMenu>
		);
	}
}

export default localize( ReaderSidebarLists );
