import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';
export class ReaderSidebarListsListItem extends Component {
	static propTypes = {
		list: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		currentListOwner: PropTypes.string,
		currentListSlug: PropTypes.string,
	};

	componentDidMount() {
		// Scroll to the current list
		if (
			this.props.list.slug === this.props.currentListSlug &&
			this.props.list.owner === this.props.currentListOwner
		) {
			const node = ReactDom.findDOMNode( this );
			node.scrollIntoView();
		}
	}

	handleListSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_list_item' );
		recordGaEvent( 'Clicked Reader Sidebar List Item' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_list_item_clicked', {
			list: decodeURIComponent( this.props.list.slug ),
		} );
	};

	render() {
		const { list, translate } = this.props;
		const listRelativeUrl = `/reader/list/${ list.owner }/${ list.slug }`;
		const listManagementUrls = [
			listRelativeUrl + '/items',
			listRelativeUrl + '/edit',
			listRelativeUrl + '/export',
			listRelativeUrl + '/delete',
		];

		const pathSegments = this.props.path?.split( '/' );
		const lastPathSegment =
			Array.isArray( pathSegments ) && pathSegments[ pathSegments.length - 1 ];
		const isCurrentList =
			lastPathSegment &&
			// Prevents partial slug matches (e.g. bluefuton/test and bluefuton/test2)
			lastPathSegment.toLowerCase() === list.slug.toLowerCase() &&
			ReaderSidebarHelper.pathStartsWithOneOf( [ listRelativeUrl ], this.props.path );
		const isCurrentListManage = ReaderSidebarHelper.pathStartsWithOneOf(
			listManagementUrls,
			this.props.path
		);

		const selected = isCurrentList || isCurrentListManage;
		return (
			<MenuItem className="sidebar__menu-item--reader-list" key={ list.ID } selected={ selected }>
				<MenuItemLink
					className="sidebar__menu-link"
					href={ listRelativeUrl }
					onClick={ this.handleListSidebarClick }
					title={ translate( "View list '%(currentListName)s'", {
						args: {
							currentListName: list.title,
						},
					} ) }
				>
					<div className="sidebar__menu-item-title">{ list.title }</div>
				</MenuItemLink>
			</MenuItem>
		);
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( ReaderSidebarListsListItem ) );
