import { Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getMostRecentlySelectedSiteId, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { savePostMutation } from './hooks/use-post-mutation';
import './style.scss';

// Initialize the editor blocks and text formatting.
loadBlocksWithCustomizations();
loadTextFormatting();

// Note: The post data we receive from the API response does
// not match the type in the stream data, but we can insert
// the post data there for now until we create a corresponding
// structure for the newly created post in the stream.

export default function QuickPost() {
	const translate = useTranslate();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const STORAGE_KEY = 'reader_quick_post_content';
	const [ postContent, setPostContent ] = useState( () => {
		return localStorage.getItem( STORAGE_KEY ) || '';
	} );
	const [ editorKey, setEditorKey ] = useState( 0 );
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
	const siteId = selectedSiteId || mostRecentlySelectedSiteId || primarySiteId || undefined;
	const siteAdminUrl = useSelector(
		( state ) => ( siteId ? getSiteAdminUrl( state, siteId ) : null ),
		( siteId ) => !! siteId
	);

	const {
		mutate: save,
		isPending: isSaving,
		variables: postVariables,
	} = useMutation( savePostMutation( { siteId } ) );

	const clearEditor = () => {
		localStorage.removeItem( STORAGE_KEY );
		setPostContent( '' );
		setEditorKey( ( key ) => key + 1 );
	};

	useEffect( () => {
		if ( postContent ) {
			localStorage.setItem( STORAGE_KEY, postContent );
		}
	}, [ postContent ] );

	const handleSubmit = () => {
		if ( ! siteId ) {
			dispatch( warningNotice( translate( 'Please select a site.' ) ) );
			return;
		}

		if ( postContent.trim().length === 0 ) {
			dispatch( warningNotice( translate( 'Please fill in the post content.' ) ) );
			return;
		}

		clearEditor();
		save(
			{ siteId, postContent, status: 'publish' },
			{
				onSuccess: ( data ) => {
					clearEditor();
					dispatch(
						successNotice(
							translate( 'Post successful! Your post will appear in the feed soon.' ),
							{
								button: translate( 'View Post.' ),
								href: data.URL,
								onClick: () => {
									window.open( data.URL, '_blank' );
								},
							}
						)
					);
				},
				onError: ( error ) => {
					recordReaderTracksEvent( 'calypso_reader_quick_post_error', {
						error: error.message,
					} );

					dispatch(
						errorNotice( translate( 'Sorry, something went wrong. Please try again.' ), {
							duration: 5000,
						} )
					);
				},
			}
		);
	};

	const handleSiteSelect = ( siteId: number ) => {
		dispatch( setSelectedSiteId( siteId ) );
	};

	const getButtonText = () => {
		if ( postVariables?.status === 'draft' && isSaving ) {
			return translate( 'Saving…' );
		}

		if ( postVariables?.status === 'publish' && isSaving ) {
			return translate( 'Posting…' );
		}

		return translate( 'Post' );
	};

	const handleFullEditorClick = () => {
		const isEmpty = postContent.trim().length === 0;
		recordReaderTracksEvent( 'calypso_reader_quick_post_full_editor_opened' );

		if ( ! isEmpty && siteId ) {
			save(
				{ siteId, postContent, status: 'draft' },
				{
					onSuccess: ( data ) => {
						clearEditor();
						window.location.assign(
							addQueryArgs( `${ siteAdminUrl }/post.php`, { post: data.ID, action: 'edit' } )
						);
					},
					onError: ( error ) => {
						recordReaderTracksEvent( 'calypso_reader_quick_post_error', {
							error: error.message,
						} );
					},
				}
			);
		} else {
			window.location.assign( addQueryArgs( `${ siteAdminUrl }/post.php`, { type: 'post' } ) );
		}
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
							<PopoverMenuItem target="_blank" rel="noreferrer" onClick={ handleFullEditorClick }>
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
				<Button variant="primary" onClick={ handleSubmit } isBusy={ isSaving }>
					{ getButtonText() }
				</Button>
			</div>
		</div>
	);
}
