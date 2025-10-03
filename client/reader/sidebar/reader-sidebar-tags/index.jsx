import page from '@automattic/calypso-router';
import { localize } from 'i18n-calypso';
import { startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryReaderFollowedTags from 'calypso/components/data/query-reader-followed-tags';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderTagIcon from 'calypso/reader/components/icons/tag-icon';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { requestFollowTag } from 'calypso/state/reader/tags/items/actions';
import { getReaderFollowedTags } from 'calypso/state/reader/tags/selectors';
import { AddTagForm } from './add-tags-form';
import ReaderSidebarTagsList from './list';

export class ReaderSidebarTags extends Component {
	static propTypes = {
		tags: PropTypes.array,
		path: PropTypes.string.isRequired,
		isOpen: PropTypes.bool,
		onClick: PropTypes.func,
		currentTag: PropTypes.string,
		onFollowTag: PropTypes.func,
		translate: PropTypes.func,
	};

	state = {
		addTagCounter: 0,
	};

	followTag = ( tag ) => {
		if ( startsWith( tag, '#' ) ) {
			tag = tag.substring( 1 );
		}

		this.props.followTag( decodeURIComponent( tag ) );
		recordAction( 'followed_topic' );
		recordGaEvent( 'Clicked Follow Topic', tag );
		this.props.recordReaderTracksEvent( 'calypso_reader_reader_tag_followed', { tag } );
		this.props.onFollowTag( tag );

		// reset the FormTextInputWithAction field to empty by rerendering it with a new `key`
		this.setState( ( state ) => ( { addTagCounter: state.addTagCounter + 1 } ) );
	};

	selectMenu = () => {
		const { onClick, tags, isOpen, path } = this.props;
		if ( ! isOpen ) {
			onClick();
		}
		const defaultSelection = tags?.length ? `/tag/${ tags[ 0 ]?.slug }` : '/tags';
		if ( path !== defaultSelection ) {
			page( defaultSelection );
		}
	};

	render() {
		const { tags, isOpen, translate, onClick, path } = this.props;

		return (
			<li className="sidebar-streams__tags">
				{ ! tags && <QueryReaderFollowedTags /> }
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Tags' ) }
					onClick={ this.selectMenu }
					customIcon={ <ReaderTagIcon viewBox="0 0 24 24" /> }
					disableFlyout
					className={ path.startsWith( '/tag' ) && 'sidebar__menu--selected' }
					expandableIconClick={ onClick }
				>
					<ReaderSidebarTagsList { ...this.props } />
					<li className="sidebar-menu__item add-tag-form">
						<AddTagForm onAction={ this.followTag } />
					</li>
				</ExpandableSidebarMenu>
			</li>
		);
	}
}

export default connect(
	( state ) => ( {
		tags: getReaderFollowedTags( state ),
	} ),
	{
		followTag: requestFollowTag,
		recordReaderTracksEvent,
	}
)( localize( ReaderSidebarTags ) );
