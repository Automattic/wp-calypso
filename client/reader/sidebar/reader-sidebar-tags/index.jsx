import { followReadTagMutation } from '@automattic/api-queries';
import page from '@automattic/calypso-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { localize, translate as i18nTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect, useDispatch } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderTagIcon from 'calypso/reader/components/icons/tag-icon';
import { useFollowedTags } from 'calypso/reader/data/tags';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
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
		if ( ( tag ?? '' ).startsWith( '#' ) ) {
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
		const { isOpen, translate, onClick, path } = this.props;

		return (
			<li className="sidebar-streams__tags">
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

function withFollowedReaderTags( Inner ) {
	return function WithFollowedReaderTags( props ) {
		const { data: tags } = useFollowedTags();
		return <Inner { ...props } tags={ tags } />;
	};
}

function withFollowTagMutation( Inner ) {
	return function WithFollowTagMutation( props ) {
		const queryClient = useQueryClient();
		const dispatch = useDispatch();
		const { mutate: follow } = useMutation( followReadTagMutation( queryClient ) );

		const followTag = ( tag ) =>
			follow( tag, {
				onError: () =>
					dispatch(
						errorNotice( i18nTranslate( 'Could not follow tag: %(tag)s', { args: { tag } } ) )
					),
			} );

		return <Inner { ...props } followTag={ followTag } />;
	};
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withFollowedReaderTags( withFollowTagMutation( localize( ReaderSidebarTags ) ) ) );
