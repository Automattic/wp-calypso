import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import ReaderSidebarHelper from '../helper';
import { MenuItem, MenuItemLink } from '../menu';
import ReaderSidebarTagsListItem from './list-item';

export class ReaderSidebarTagsList extends Component {
	static propTypes = {
		tags: PropTypes.array,
		path: PropTypes.string.isRequired,
		currentTag: PropTypes.string,
		translate: PropTypes.func,
	};

	renderItems() {
		const { path, currentTag, tags } = this.props;
		return map( tags, ( tag ) => (
			<ReaderSidebarTagsListItem
				key={ tag.id }
				tag={ tag }
				path={ path }
				currentTag={ currentTag }
			/>
		) );
	}
	trackTagsPageClick() {
		recordAction( 'clicked_reader_sidebar_tags_page_link' );
		recordGaEvent( 'Clicked Reader Sidebar Tags Page Link' );
		recordReaderTracksEvent( 'calypso_reader_sidebar_tags_page_link_clicked' );
	}
	render() {
		return (
			<>
				{ this.renderItems() }
				<MenuItem
					className={ ReaderSidebarHelper.itemLinkClass( '/tags', this.props.path, {
						'sidebar-dynamic-menu__tag': true,
					} ) }
				>
					<MenuItemLink href="/tags" onClick={ this.trackTagsPageClick }>
						<span className="reader-sidebar-tags__all-tags-link">
							{ this.props.translate( 'See all tags' ) }
						</span>
					</MenuItemLink>
				</MenuItem>
			</>
		);
	}
}

export default localize( ReaderSidebarTagsList );
