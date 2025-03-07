import config from '@automattic/calypso-config';
import { Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import { connect } from 'react-redux';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { stripHTML } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { receiveNewPost } from 'calypso/state/reader/streams/actions';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

// Initialize the editor blocks and text formatting.
loadBlocksWithCustomizations();
loadTextFormatting();

// Note: The post data we receive from the API response does
// not match the type in the stream data, but we can insert
// the post data there for now until we create a corresponding
// structure for the newly created post in the stream.
interface PostItem {
	ID: number;
	site_ID: number;
	title: string;
	content: string;
	URL: string;
}

function QuickPost( {
	receivePosts,
	successNotice,
}: {
	receivePosts: ( posts: PostItem[] ) => Promise< void >;
	successNotice: ( message: string, options: object ) => void;
} ) {
	const translate = useTranslate();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const [ postContent, setPostContent ] = useState( '' );
	const [ editorKey, setEditorKey ] = useState( 0 );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const editorRef = useRef< HTMLDivElement >( null );
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const hasLoaded = useSelector( hasLoadedSites );
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;

	const clearEditor = () => {
		setEditorKey( ( key ) => key + 1 );
	};

	const handleSubmit = () => {
		if ( ! postContent.trim() || ! selectedSiteId || isSubmitting ) {
			return;
		}

		setIsSubmitting( true );

		wpcom
			.site( selectedSiteId )
			.post()
			.add( {
				title:
					(
						stripHTML( postContent )
							.split( '\n' )
							.find( ( line ) => line.trim() ) || ''
					)
						.substring( 0, 57 )
						.trim() + '...',
				content: postContent,
				status: 'publish',
			} )
			.then( ( postData: PostItem ) => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_submitted' );
				clearEditor();

				successNotice( translate( 'Post successful! Your post will appear in the feed soon.' ), {
					button: translate( 'View Post.' ),
					noticeActionProps: {
						external: true,
					},
					href: postData.URL,
				} );
				// TODO: Update the stream with the new post (if they're subscribed?) to signal success.

				if ( config.isEnabled( 'reader/quick-post-v2' ) ) {
					receivePosts( [ postData ] ).then( () => {
						// Actual API response will update the stream with the real post data
						dispatch(
							receiveNewPost( {
								streamKey: `following`,
								postData,
							} )
						);
					} );
				}
			} )
			.catch( () => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_error' );
				// TODO: Add error handling
			} )
			.finally( () => {
				setIsSubmitting( false );
			} );
	};

	const handleCancel = () => {
		clearEditor();
	};

	const handleSiteSelect = ( siteId: number ) => {
		dispatch( setSelectedSiteId( siteId ) );
	};

	const getButtonText = () => {
		if ( isSubmitting ) {
			return translate( 'Posting' );
		}
		return translate( 'Post' );
	};

	if ( ! hasLoaded ) {
		return (
			<div className="quick-post-input quick-post-input--loading">
				<Spinner />
			</div>
		);
	}

	if ( ! hasSites ) {
		return null; // Don't show QuickPost if user has no sites.
	}

	const isDisabled = isSubmitting;

	return (
		<div className="quick-post-input">
			<div className="quick-post-input__fields">
				<div className="quick-post-input__site-select-wrapper">
					<SitesDropdown
						selectedSiteId={ selectedSiteId || undefined }
						onSiteSelect={ handleSiteSelect }
						isPlaceholder={ ! hasLoaded }
					/>
				</div>
				<div className="verbum-editor-wrapper" ref={ editorRef }>
					<Editor
						key={ editorKey }
						initialContent=""
						onChange={ setPostContent }
						isRTL={ isLocaleRtl( locale ) ?? false }
						isDarkMode={ false }
					/>
				</div>
			</div>
			<div className="quick-post-input__actions">
				<Button
					onClick={ handleCancel }
					disabled={ isDisabled }
					className="quick-post-input__cancel"
				>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleSubmit }
					disabled={ ! postContent.trim() || isDisabled }
				>
					{ getButtonText() }
				</Button>
			</div>
		</div>
	);
}

export default connect( null, {
	successNotice: ( message: string, options: object ) => successNotice( message, options ),
	receivePosts: ( posts: PostItem[] ) => receivePosts( posts ) as Promise< void >,
} )( QuickPost );
