import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
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
		recordReaderTracksEvent: PropTypes.func,
		translate: PropTypes.func,
	};

	navigateToLists = () => {
		page( '/reader/lists' );

		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_lists_dropdown_title_clicked' );
	};

	render() {
		const { translate, isOpen, onClick, path, ...passedProps } = this.props;

		return (
			<li>
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Lists' ) }
					onClick={ this.navigateToLists }
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

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( ReaderSidebarLists ) );
