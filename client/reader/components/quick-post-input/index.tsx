import { Button, Spinner } from '@automattic/components';
import type { SiteDetails } from '@automattic/data-stores';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { useTranslate } from 'i18n-calypso';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormSelect from 'calypso/components/forms/form-select';
import wpcom from 'calypso/lib/wp';
import { READER_STREAMS_PAGE_REQUEST } from 'calypso/state/reader/action-types';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { clearStream } from 'calypso/state/reader/streams/actions';
import getSites from 'calypso/state/selectors/get-sites';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { createBlock, serialize } from '@wordpress/blocks';
import './style.scss';

// Initialize the editor blocks and text formatting
loadBlocksWithCustomizations();
loadTextFormatting();

const REFRESH_DELAY = 2000; // 2 seconds delay to allow for post indexing

// Create an initial empty paragraph block
const initialBlock = serialize( [ createBlock( 'core/paragraph', { content: '' } ) ] );

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

	// Focus editor on load
	useEffect( () => {
		const timeoutId = setTimeout( () => {
			if ( editorRef.current ) {
				const rootContainer = editorRef.current.querySelector( '.is-root-container' );
				if ( rootContainer instanceof HTMLElement ) {
					rootContainer.focus();
					// Create a click event to simulate user interaction
					const clickEvent = new MouseEvent( 'click', {
						bubbles: true,
						cancelable: true,
						view: window,
					} );
					rootContainer.dispatchEvent( clickEvent );
				}
			}
		}, 100 );

		return () => clearTimeout( timeoutId );
	}, [] );

	// Set initial selected site once sites are loaded
	useEffect( () => {
		if ( hasLoaded && sites.length > 0 && ! selectedSiteId ) {
			setSelectedSiteId( sites[ 0 ].ID );
		}
	}, [ hasLoaded, sites, selectedSiteId ] );

	const refreshStream = async () => {
		setIsRefreshing( true );
		try {
			dispatch( clearStream( { streamKey: 'following' } ) );
			await new Promise( ( resolve ) => setTimeout( resolve, REFRESH_DELAY ) );
			dispatch( {
				type: READER_STREAMS_PAGE_REQUEST,
				payload: {
					streamKey: 'following',
					streamType: 'following',
					pageHandle: null,
					isPoll: false,
				},
			} );
		} finally {
			setIsRefreshing( false );
		}
	};

	const handleSubmit = async () => {
		if ( ! postContent.trim() || ! selectedSiteId || isSubmitting ) return;

		setIsSubmitting( true );
		try {
			await wpcom
				.site( selectedSiteId )
				.post()
				.add( {
					title: postContent.split( '\n' )[ 0 ], // Use first line as title
					content: postContent,
					status: 'publish',
				} );

			recordReaderTracksEvent( 'calypso_reader_quick_post_submitted' );
			setPostContent( initialBlock );
			refreshStream();
		} catch ( error ) {
			recordReaderTracksEvent( 'calypso_reader_quick_post_error' );
			// TODO: Add error handling UI
			console.error( 'Failed to create post:', error );
		} finally {
			setIsSubmitting( false );
		}
	};

	const handleCancel = () => {
		setPostContent( initialBlock );
	};

	const handleSiteChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setSelectedSiteId( Number( event.target.value ) );
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
					{ isSubmitting
						? translate( 'Posting...' )
						: isRefreshing
						? translate( 'Refreshing...' )
						: translate( 'Post' ) }
				</Button>
			</div>
		</div>
	);
}
