import { Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { useMutation } from '@tanstack/react-query';
// @ts-expect-error - No declaration file for heading block.
import * as heading from '@wordpress/block-library/build-module/heading';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
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
loadBlocksWithCustomizations( [ heading ] );
loadTextFormatting( [ heading.name ] );
interface Props {
	className?: string;
}

// Note: The post data we receive from the API response does
// not match the type in the stream data, but we can insert
// the post data there for now until we create a corresponding
// structure for the newly created post in the stream.
export default function QuickPost( { className }: Props ) {
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

	const handlePublish = () => {
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
					recordReaderTracksEvent( 'calypso_reader_quick_post_submitted', {
						post_id: data.ID,
						post_url: data.URL,
						site_id: siteId,
					} );

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
	const isPublishing = postVariables?.status === 'publish' && isSaving;
	const isSavingDraft = postVariables?.status === 'draft' && isSaving;

	return (
		<div className={ clsx( 'quick-post-input', className ) }>
			<VStack spacing={ 4 }>
				<SitesDropdown
					selectedSiteId={ siteId }
					onSiteSelect={ handleSiteSelect }
					isPlaceholder={ ! hasLoaded }
				/>
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
				<HStack justify="flex-end">
					<Button
						variant="tertiary"
						onClick={ handleFullEditorClick }
						title={ translate( 'Edit using the full editor.' ) }
						disabled={ isPublishing }
						isBusy={ isSavingDraft }
					>
						<HStack spacing={ 2 }>
							<span>{ isSavingDraft ? translate( 'Saving…' ) : translate( 'Edit' ) }</span>{ ' ' }
							<span>{ isLocaleRtl( locale ) ? '\u2196' : '\u2197' }</span>
						</HStack>
					</Button>
					<Button
						variant="primary"
						onClick={ handlePublish }
						disabled={ isPublishing || isSavingDraft }
						isBusy={ isPublishing }
					>
						{ isPublishing ? translate( 'Posting…' ) : translate( 'Post' ) }
					</Button>
				</HStack>
			</VStack>
		</div>
	);
}
