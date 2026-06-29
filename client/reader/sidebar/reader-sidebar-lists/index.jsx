import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderListIcon from 'calypso/reader/components/icons/list-icon';
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

	selectMenu = () => {
		const { onClick } = this.props;
		onClick();
	};

	render() {
		const { translate, isOpen, onClick, path, ...passedProps } = this.props;

		return (
			<li>
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Lists' ) }
					onClick={ this.selectMenu }
					customIcon={ <ReaderListIcon viewBox="0 0 24 24" /> }
					disableFlyout
					className={ path.startsWith( '/reader/list' ) ? 'sidebar__menu--selected' : '' }
					expandableIconClick={ onClick }
				>
					<ReaderSidebarListsList path={ path } { ...passedProps } />
				</ExpandableSidebarMenu>
			</li>
		);
	}
}

export default localize( ReaderSidebarLists );
