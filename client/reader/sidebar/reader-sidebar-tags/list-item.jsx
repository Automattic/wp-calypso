import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';

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

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<li
				key={ tag.id }
				className={ ReaderSidebarHelper.itemLinkClass( '/tag/' + tag.slug, path, {
					'sidebar-dynamic-menu__tag': true,
				} ) }
			>
				<a
					className="sidebar__menu-link"
					href={ tag.url }
					onClick={ this.handleTagSidebarClick }
					title={ translate( "View tag '%(currentTagName)s'", {
						args: {
							currentTagName: tagName,
						},
					} ) }
				>
					<div className="sidebar__menu-item-tagname">{ tagName }</div>
				</a>
			</li>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( ReaderSidebarTagsListItem ) );
