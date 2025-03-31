import config from '@automattic/calypso-config';
import { Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { Button } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { stripHTML } from 'calypso/lib/formatting';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { receiveNewPost } from 'calypso/state/reader/streams/actions';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getMostRecentlySelectedSiteId, getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	const STORAGE_KEY = 'reader_quick_post_content';
	const [ postContent, setPostContent ] = useState( () => {
		// Use localStorage to save content between sessions.
		return localStorage.getItem( STORAGE_KEY ) || '';
	} );
	const [ editorKey, setEditorKey ] = useState( 0 );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const editorRef = useRef< HTMLDivElement >( null );
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const mostRecentlySelectedSiteId = useSelector( getMostRecentlySelectedSiteId );
	const primarySiteId = useSelector( getPrimarySiteId );
	const hasLoaded = useSelector( hasLoadedSites );
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;
	const [ isMenuVisible, setIsMenuVisible ] = useState( false );
	const popoverButtonRef = useRef< HTMLButtonElement >( null );

	useEffect( () => {
		if ( postContent ) {
			localStorage.setItem( STORAGE_KEY, postContent );
		}
	}, [ postContent ] );

	const clearEditor = () => {
		localStorage.removeItem( STORAGE_KEY );
		setPostContent( '' );
		setEditorKey( ( key ) => key + 1 );
	};

	const siteId = selectedSiteId || mostRecentlySelectedSiteId || primarySiteId || undefined;

	const handleSubmit = () => {
		if ( ! postContent.trim() || ! siteId || isSubmitting ) {
			return;
		}

		setIsSubmitting( true );

		wpcom
			.site( siteId )
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
								streamKey: 'following',
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

	const handleSiteSelect = ( siteId: number ) => {
		dispatch( setSelectedSiteId( siteId ) );
	};

	const getButtonText = () => {
		if ( isSubmitting ) {
			return translate( 'Posting' );
		}
		return translate( 'Post' );
	};

	const handleFullEditorClick = () => {
		recordReaderTracksEvent( 'calypso_reader_quick_post_full_editor_opened' );
	};

	const toggleMenu = () => setIsMenuVisible( ! isMenuVisible );
	const closeMenu = () => setIsMenuVisible( false );

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
						selectedSiteId={ siteId }
						onSiteSelect={ handleSiteSelect }
						isPlaceholder={ ! hasLoaded }
					/>
					<div className="quick-post-input__actions-menu">
						<Button
							ref={ popoverButtonRef }
							icon={ moreVertical }
							onClick={ toggleMenu }
							aria-expanded={ isMenuVisible }
							className="quick-post-input__actions-toggle"
						/>
						<PopoverMenu
							context={ popoverButtonRef.current }
							isVisible={ isMenuVisible }
							onClose={ closeMenu }
							position="bottom"
							className="quick-post-input__popover"
						>
							<PopoverMenuItem
								href={ siteId ? `/post/${ siteId }?type=post` : '/post' }
								target="_blank"
								rel="noreferrer"
								onClick={ handleFullEditorClick }
							>
								{ translate( 'Open Full Editor' ) }
							</PopoverMenuItem>
						</PopoverMenu>
					</div>
				</div>
				<div className="verbum-editor-wrapper" ref={ editorRef }>
					<Editor
						key={ editorKey }
						initialContent={ postContent }
						onChange={ setPostContent }
						isRTL={ isLocaleRtl( locale ) ?? false }
						isDarkMode={ false }
						customStyles={ `
							div.is-root-container.block-editor-block-list__layout {
								padding-bottom: 20px;
							}
						` }
					/>
				</div>
			</div>
			<div className="quick-post-input__actions">
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
