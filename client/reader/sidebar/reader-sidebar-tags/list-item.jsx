import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';

export class ReaderSidebarTagsListItem extends Component {
	static propTypes = {
		tag: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
	};

	componentDidMount() {
		// Scroll to the current tag
		if ( this.props.currentTag && this.props.tag.slug === this.props.currentTag ) {
			const node = ReactDom.findDOMNode( this );
			node.scrollIntoView();
		}
	}

	handleTagSidebarClick = () => {
		recordAction( 'clicked_reader_sidebar_tag_item' );
		recordGaEvent( 'Clicked Reader Sidebar Tag Item' );
		this.props.recordReaderTracksEvent( 'calypso_reader_sidebar_tag_item_clicked', {
			tag: decodeURIComponent( this.props.tag.slug ),
		} );
	};

	render() {
		const { tag, path, translate } = this.props;
		const tagName = tag.displayName || tag.slug;
		const computedClassName = ReaderSidebarHelper.itemLinkClass( '/tag/' + tag.slug, path );
		const selected = computedClassName.includes( 'selected' );

		return (
			<MenuItem key={ tag.id } selected={ selected }>
				<MenuItemLink
					href={ tag.url }
					onClick={ this.handleTagSidebarClick }
					title={ translate( "View tag '%(currentTagName)s'", {
						args: {
							currentTagName: tagName,
						},
					} ) }
				>
					<span className="sidebar__menu-link-text">{ tagName }</span>
				</MenuItemLink>
			</MenuItem>
		);
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( ReaderSidebarTagsListItem ) );
