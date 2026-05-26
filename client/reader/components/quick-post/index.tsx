import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
	addApiMiddleware,
} from '@automattic/verbum-block-editor';
import { EmbedRequestParams } from '@automattic/verbum-block-editor/src/api';
import { useMutation } from '@tanstack/react-query';
// @ts-expect-error - No declaration file for heading block.
import * as heading from '@wordpress/block-library/build-module/heading';
import { createBlock, parse, serialize } from '@wordpress/blocks';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import SitesDropdown from 'calypso/components/sites-dropdown';
import { DEFAULT_SCHEME, PREFERENCE_KEY, isColorScheme } from 'calypso/lib/color-scheme';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice, warningNotice } from 'calypso/state/notices/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getMostRecentlySelectedSiteId, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { savePostMutation } from './hooks/use-post-mutation';
import type { AppState } from 'calypso/types';

import './style.scss';

// Initialize the editor blocks and text formatting.
loadBlocksWithCustomizations( [ heading ] );
loadTextFormatting( [ heading.name ] );

// Add API middleware for embeds.
// This redirects `/wp-json/oembed/1.0/proxy` requests to the WordPress.com embed API.
// Because we are not using verbum editor in site context.
addApiMiddleware(
	( embedURL: string ): EmbedRequestParams => ( {
		path: '/verbum/embed',
		query: `embed_url=${ encodeURIComponent( embedURL ) }`,
		apiNamespace: 'wpcom/v2',
	} )
);

const QUICK_POST_EDITOR_BASE_STYLES = `
	div.is-root-container.block-editor-block-list__layout {
		padding-bottom: 20px;
	}
`;

const QUICK_POST_EDITOR_DARK_STYLES = `
	html,
	body,
	.editor-styles-wrapper,
	div.is-root-container.block-editor-block-list__layout {
		background-color: #2a2a2a;
		color: #e0e0e0;
	}

	.block-editor-rich-text__editable,
	.block-editor-block-list__layout .block-editor-block-list__block {
		color: #e0e0e0;
	}

	.block-editor-default-block-appender__content {
		color: #bdbdbd;
	}
`;

export default function QuickPost(): JSX.Element | null {
	const translate = useTranslate();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const STORAGE_KEY = 'reader_quick_post_content';
	const [ postContent, setPostContent ] = useState( () => {
		return localStorage.getItem( STORAGE_KEY ) || getInitialPostContent();
	} );
	const [ editorKey, setEditorKey ] = useState( 0 );
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const mostRecentlySelectedSiteId = useSelector( getMostRecentlySelectedSiteId );
	const primarySiteId = useSelector( getPrimarySiteId );
	const hasLoaded = useSelector( hasLoadedSites );
	const savedColorScheme = useSelector( ( state: AppState ) =>
		getPreference( state, PREFERENCE_KEY )
	);
	const colorScheme = isColorScheme( savedColorScheme ) ? savedColorScheme : DEFAULT_SCHEME;
	const systemPrefersDark = useMediaQuery( '(prefers-color-scheme: dark)' );
	const isReaderDarkMode =
		colorScheme === 'dark' || ( colorScheme === 'system' && systemPrefersDark );
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;
	const siteId = selectedSiteId || mostRecentlySelectedSiteId || primarySiteId || undefined;
	const siteAdminUrl = useSelector( ( state ) =>
		siteId ? getSiteAdminUrl( state, siteId ) : null
	);

	const {
		mutate: save,
		isPending: isSaving,
		variables: postVariables,
	} = useMutation( savePostMutation( { siteId } ) );
	const isPublishing = postVariables?.status === 'publish' && isSaving;
	const isSavingDraft = postVariables?.status === 'draft' && isSaving;

	const clearEditor = () => {
		localStorage.removeItem( STORAGE_KEY );
		setPostContent( getInitialPostContent() );
		setEditorKey( ( key ) => key + 1 );
	};

	function getInitialPostContent(): string {
		return serialize( [
			createBlock( 'core/paragraph', { placeholder: translate( 'Write your post here…' ) } ),
		] );
	}

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

		if ( isPostContentEmpty() ) {
			dispatch( warningNotice( translate( 'Please fill in the post content.' ) ) );
			return;
		}

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
								onClick: () => {
									window.open( data.URL, '_blank', 'noopener,noreferrer' );
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

	function isPostContentEmpty(): boolean {
		const parsedContent = parse( postContent );

		if ( parsedContent.length !== 1 || parsedContent[ 0 ].name !== 'core/paragraph' ) {
			return false;
		}

		const content = ( parsedContent[ 0 ].attributes as { content?: string } ).content;
		return typeof content === 'string' && content.trim().length === 0;
	}

	const handleSiteSelect = ( siteId: number ) => {
		dispatch( setSelectedSiteId( siteId ) );
	};

	const handleFullEditorClick = () => {
		recordReaderTracksEvent( 'calypso_reader_quick_post_full_editor_opened' );

		if ( ! isPostContentEmpty() && siteId ) {
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

	if ( ! hasSites ) {
		return null; // Don't show QuickPost if user has no sites.
	}

	return (
		<div className="quick-post">
			<SitesDropdown
				selectedSiteId={ siteId }
				onSiteSelect={ handleSiteSelect }
				isPlaceholder={ ! hasLoaded }
			/>

			<div className="verbum-editor-wrapper">
				<Editor
					key={ editorKey }
					focusOnMount={ false }
					initialContent={ postContent }
					onChange={ setPostContent }
					isRTL={ isLocaleRtl( locale ) ?? false }
					isDarkMode={ isReaderDarkMode }
					customStyles={ `${
						isReaderDarkMode ? QUICK_POST_EDITOR_DARK_STYLES : ''
					}${ QUICK_POST_EDITOR_BASE_STYLES }` }
				/>
			</div>

			<HStack className="quick-post-actions" justify="flex-end">
				<Button
					variant="tertiary"
					onClick={ handleFullEditorClick }
					title={ translate( 'Edit using the full editor.' ) }
					disabled={ isPublishing }
					isBusy={ isSavingDraft }
				>
					<span>{ isSavingDraft ? translate( 'Saving…' ) : translate( 'Edit' ) }</span>
					<span>{ isLocaleRtl( locale ) ? '\u2196' : '\u2197' }</span>
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
		</div>
	);
}
