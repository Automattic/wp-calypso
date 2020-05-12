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
import ExpandableSidebarMenu from 'layout/sidebar/expandable';
import ReaderSidebarListsList from './list';

export class ReaderSidebarLists extends Component {
	static propTypes = {
		lists: PropTypes.array,
		hasUnseen: PropTypes.bool,
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
		const { translate, isOpen, onClick, hasUnseen, ...passedProps } = this.props;
		return (
			<div className={ hasUnseen ? 'has-unseen' : '' }>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
				{ hasUnseen && <span className="sidebar__bubble" /> }
				<ExpandableSidebarMenu
					hasNew={ hasUnseen }
					expanded={ isOpen }
					title={ translate( 'Lists' ) }
					onClick={ onClick }
					materialIcon={ 'list' }
					hideAddButton
				>
					<ReaderSidebarListsList { ...passedProps } />
				</ExpandableSidebarMenu>
			</div>
		);
	}
}

export default localize( ReaderSidebarLists );
