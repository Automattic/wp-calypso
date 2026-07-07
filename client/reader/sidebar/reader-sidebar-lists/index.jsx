import './style.scss';
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
					onClick={ onClick }
					disableFlyout
					className={ clsx( {
						'sidebar__menu--selected':
							! isOpen && ( isChildSelected || path === '/reader/list/new' ),
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
