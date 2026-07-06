import './style.scss';
import page from '@automattic/calypso-router';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
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

	selectMenu = () => {
		const { onClick, lists, isOpen, path } = this.props;
		const defaultSelection = lists?.length
			? `/reader/list/${ lists[ 0 ]?.owner }/${ lists[ 0 ]?.slug }`
			: '/reader/list/new';
		if ( ! isOpen ) {
			onClick();
		}
		if ( path !== defaultSelection ) {
			page( defaultSelection );
		}
	};

	render() {
		const { translate, isOpen, onClick, lists, path, ...passedProps } = this.props;
		const isChildSelected = lists?.some( ( list ) =>
			path.startsWith( `/reader/list/${ list.owner }/${ list.slug }` )
		);

		return (
			<li>
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Lists' ) }
					onClick={ this.selectMenu }
					disableFlyout
					className={ clsx( {
						'sidebar__menu--selected':
							path === '/reader/lists' ||
							( ! isOpen && ( isChildSelected || path === '/reader/list/new' ) ),
					} ) }
					expandableIconClick={ onClick }
				>
					<ReaderSidebarListsList path={ path } lists={ lists } { ...passedProps } />
				</ExpandableSidebarMenu>
			</li>
		);
	}
}

export default localize( ReaderSidebarLists );
