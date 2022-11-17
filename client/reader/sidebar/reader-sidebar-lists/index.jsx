import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import IconSidebarLists from 'calypso/assets/images/reader/sidebar/lists.svg';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderSidebarListsList from './list';

import './style.scss';

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

	render() {
		const { translate, isOpen, onClick, path, ...passedProps } = this.props;
		return (
			<li>
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Lists' ) }
					onClick={ onClick }
					customSvg={ IconSidebarLists }
					disableFlyout={ true }
					className={ path.startsWith( '/read/list' ) && 'sidebar__menu--selected' }
				>
					<li>
						<ReaderSidebarListsList path={ path } { ...passedProps } />
					</li>
				</ExpandableSidebarMenu>
			</li>
		);
	}
}

export default localize( ReaderSidebarLists );
