import { sitesQuery } from '@automattic/api-queries';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
// @ts-expect-error - No declaration file for heading block.
import * as heading from '@wordpress/block-library/build-module/heading';
import { createBlock, parse, serialize } from '@wordpress/blocks';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { translate, useTranslate } from 'i18n-calypso';
import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { savePostMutation } from './hooks/use-post-mutation';
import { SiteSelector } from './site-selector';
import { focusEditor } from './utils';
import type { Site } from '@automattic/api-core';
import './style.scss';

// Initialize the editor blocks and text formatting.
loadBlocksWithCustomizations( [ heading ] );
loadTextFormatting( [ heading.name ] );
interface Props {
	className?: string;
}

const STORAGE_KEY = 'reader_quick_post_content';

const isEmptyContent = ( content: string ) => {
	const parsedContent = parse( content );
	return (
		parsedContent.length === 1 &&
		parsedContent[ 0 ].name === 'core/paragraph' &&
		parsedContent[ 0 ].attributes.content.trim().length === 0
	);
};

const createInitialPostContent = () => {
	return serialize( [
		createBlock( 'core/paragraph', { placeholder: translate( 'Write your post here…' ) } ),
	] );
};

export default function QuickPost( { className }: Props ) {
	const translate = useTranslate();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const [ postContent, setPostContent ] = useState( () => {
		return localStorage.getItem( STORAGE_KEY ) || createInitialPostContent();
	} );

	const { data: sites, isLoading: isLoadingSites } = useSuspenseQuery(
		sitesQuery( 'all', {
			include_a8c_owned: false,
			include_domain_only: false,
			site_visibility: 'visible',
		} )
	);
	const [ editorKey, setEditorKey ] = useState( 0 );
	const editorRef = useRef< HTMLDivElement >( null );
	const dispatch = useDispatch();
	const [ selectedSite, setSelectedSite ] = useState< Site | null >( sites?.[ 0 ] ?? null );
	const {
		mutate: save,
		isPending: isSaving,
		variables: postVariables,
	} = useMutation( savePostMutation( { siteId: selectedSite?.ID } ) );

	const isPublishing = postVariables?.status === 'publish' && isSaving;
	const isSavingDraft = postVariables?.status === 'draft' && isSaving;
	const hasSites = Array.isArray( sites ) && sites.length > 0 && ! isLoadingSites;
	const siteAdminUrl = selectedSite ? selectedSite?.options?.admin_url : null;

	const clearEditor = () => {
		localStorage.removeItem( STORAGE_KEY );
		setPostContent( createInitialPostContent() );
		setEditorKey( ( key ) => key + 1 );
	};

	useEffect( () => {
		if ( postContent ) {
			localStorage.setItem( STORAGE_KEY, postContent );
		}
	}, [ postContent ] );

	useEffect( () => {
		if ( editorRef.current ) {
			focusEditor();
		}
	}, [ editorRef.current ] );

	const handlePublish = () => {
		if ( ! selectedSite ) {
			dispatch( warningNotice( translate( 'Please select a site.' ) ) );
			return;
		}

		if ( isEmptyContent( postContent ) ) {
			dispatch( warningNotice( translate( 'Please fill in the post content.' ) ) );
			return;
		}

		save(
			{ siteId: selectedSite?.ID, postContent, status: 'publish' },
			{
				onSuccess: ( data ) => {
					clearEditor();
					recordReaderTracksEvent( 'calypso_reader_quick_post_submitted', {
						post_id: data.ID,
						post_url: data.URL,
						site_id: selectedSite.ID,
					} );

					dispatch(
						successNotice(
							translate( 'Post successful! Your post will appear in the feed soon.' ),
							{
								button: translate( 'View Post.' ),
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

	const handleSiteSelect = ( site: Site | null ) => {
		if ( ! site ) {
			return;
		}
		setSelectedSite( site );
	};

	const handleFullEditorClick = () => {
		const isEmpty = isEmptyContent( postContent );

		recordReaderTracksEvent( 'calypso_reader_quick_post_full_editor_opened' );

		if ( ! isEmpty && selectedSite ) {
			save(
				{ siteId: selectedSite.ID, postContent, status: 'draft' },
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

	if ( ! hasSites ) {
		return null;
	}

	return (
		<div className={ clsx( 'quick-post-input', className ) }>
			<VStack spacing={ 4 }>
				<SiteSelector onChange={ handleSiteSelect } value={ selectedSite } sites={ sites } />

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
