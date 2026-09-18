import { followReadTagMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { localize, translate as i18nTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect, useDispatch } from 'react-redux';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
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

	render() {
		const { isOpen, translate, onClick, tags, path } = this.props;
		const isChildSelected = tags?.some( ( tag ) => path === `/tag/${ tag.slug }` );

		return (
			<li className="sidebar-streams__tags">
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Tags' ) }
					onClick={ onClick }
					disableFlyout
					className={ clsx( {
						'sidebar__menu--selected': path === '/tags' || ( ! isOpen && isChildSelected ),
					} ) }
					expandableIconClick={ onClick }
				>
					<ReaderSidebarTagsList tags={ tags } { ...this.props } />
					<li className="sidebar__menu-item sidebar__menu-item--reader-tag add-tag-form">
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
