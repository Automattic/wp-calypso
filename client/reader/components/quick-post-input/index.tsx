import { Button, Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { createBlock, serialize } from '@wordpress/blocks';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import FormSelect from 'calypso/components/forms/form-select';
import wpcom from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { requestPage, clearStream } from 'calypso/state/reader/streams/actions';
import getSites from 'calypso/state/selectors/get-sites';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

// Initialize the editor blocks and text formatting
loadBlocksWithCustomizations();
loadTextFormatting();

// Create an initial empty paragraph block
const initialBlock = serialize( [ createBlock( 'core/paragraph', { content: '' } ) ] );

interface Post {
	ID: number;
}

interface ReaderPost {
	ID: number;
	site_ID: number;
}

interface ReaderFeedResponse {
	posts: ReaderPost[];
}

export default function QuickPostInput() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const [ postContent, setPostContent ] = useState( initialBlock );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ isRefreshing, setIsRefreshing ] = useState( false );
	const sites = useSelector( getSites ).filter( ( site ): site is SiteDetails => site !== null );
	const hasLoaded = useSelector( hasLoadedSites );
	const [ selectedSiteId, setSelectedSiteId ] = useState< number | null >( null );
	const editorRef = useRef< HTMLDivElement >( null );

	// Set initial selected site once sites are loaded
	useEffect( () => {
		if ( hasLoaded && sites.length > 0 && ! selectedSiteId ) {
			setSelectedSiteId( sites[ 0 ].ID );
		}
	}, [ hasLoaded, sites, selectedSiteId ] );

	const handleSubmit = () => {
		if ( ! postContent.trim() || ! selectedSiteId || isSubmitting ) {
			return;
		}

		setIsSubmitting( true );
		setIsRefreshing( true );

		wpcom
			.site( selectedSiteId )
			.post()
			.add( {
				title: postContent.split( '\n' )[ 0 ], // Use first line as title
				content: postContent,
				status: 'publish',
			} )
			.then( ( newPost: Post ) => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_submitted' );
				setPostContent( initialBlock );

				// Wait for post to appear in feed before refreshing
				let attempts = 0;
				const maxAttempts = 10; // Try for 10 seconds max

				const checkFeedAndRefresh = () => {
					if ( attempts >= maxAttempts ) {
						console.warn( 'Timed out waiting for post to appear in feed' );
						dispatch( clearStream( { streamKey: 'following' } ) );
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						dispatch( requestPage( { streamKey: 'following' } as any ) );
						setIsRefreshing( false );
						return;
					}

					attempts++;
					wpcom.req
						.get( '/read/following', { number: 1, meta: 'site' } )
						.then( ( response: ReaderFeedResponse ) => {
							// Check if the latest post in the feed is from our site and matches our post ID
							const latestPost = response?.posts?.[ 0 ];
							if ( latestPost?.site_ID === selectedSiteId && latestPost?.ID === newPost.ID ) {
								// Post is in feed, safe to refresh
								dispatch( clearStream( { streamKey: 'following' } ) );
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								dispatch( requestPage( { streamKey: 'following' } as any ) );
								setIsRefreshing( false );
							} else if ( attempts < maxAttempts ) {
								// Check again in 1 second if we haven't hit the limit
								setTimeout( checkFeedAndRefresh, 1000 );
							} else {
								setIsRefreshing( false );
							}
						} )
						.catch( ( error: Error ) => {
							// If checking the feed fails, still refresh but log the error
							console.error( 'Error checking feed for new post:', error );
							dispatch( clearStream( { streamKey: 'following' } ) );
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							dispatch( requestPage( { streamKey: 'following' } as any ) );
							setIsRefreshing( false );
						} );
				};

				checkFeedAndRefresh();
			} )
			.catch( ( error: Error ) => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_error' );
				// TODO: Add error handling UI
				console.error( 'Failed to create post:', error );
				setIsRefreshing( false );
			} )
			.finally( () => {
				setIsSubmitting( false );
			} );
	};

	const handleCancel = () => {
		setPostContent( initialBlock );
	};

	const handleSiteChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setSelectedSiteId( Number( event.target.value ) );
	};

	const getButtonText = () => {
		if ( isSubmitting ) {
			return translate( 'Posting' );
		}
		if ( isRefreshing ) {
			return translate( 'Refreshing' );
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

	if ( ! sites.length ) {
		return null; // Don't show input if user has no sites
	}

	const isDisabled = isSubmitting || isRefreshing;

	return (
		<div className="quick-post-input">
			<div className="quick-post-input__header">{ translate( 'Publish a post to' ) }</div>
			<div className="quick-post-input__fields">
				<FormSelect
					value={ selectedSiteId || '' }
					onChange={ handleSiteChange }
					disabled={ isDisabled }
					className="quick-post-input__site-select"
				>
					{ sites.map( ( site ) => (
						<option key={ site.ID } value={ site.ID }>
							{ site.name } ({ site.domain })
						</option>
					) ) }
				</FormSelect>
				<div className="verbum-editor-wrapper" ref={ editorRef }>
					<Editor
						initialContent={ postContent }
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
				<Button primary onClick={ handleSubmit } disabled={ ! postContent.trim() || isDisabled }>
					{ getButtonText() }
				</Button>
			</div>
		</div>
	);
}
