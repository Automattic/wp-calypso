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

	render() {
		const { translate, isOpen, onClick, path, ...passedProps } = this.props;
		const { lists } = passedProps;

		const defaultSelection = lists?.length
			? `/reader/list/${ lists[ 0 ]?.owner }/${ lists[ 0 ]?.slug }`
			: '/reader/list/new';

		return (
			<li>
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Lists' ) }
					onClick={ onClick }
					customIcon={ <ReaderListIcon viewBox="-3 0 24 24" /> }
					disableFlyout
					className={ path.startsWith( '/reader/list' ) && 'sidebar__menu--selected' }
					defaultSelection={ defaultSelection }
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
