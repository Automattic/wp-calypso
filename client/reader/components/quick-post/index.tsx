import { Spinner } from '@automattic/components';
import { isLocaleRtl, useLocale } from '@automattic/i18n-utils';
import {
	Editor,
	loadBlocksWithCustomizations,
	loadTextFormatting,
} from '@automattic/verbum-block-editor';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import FormSelect from 'calypso/components/forms/form-select';
import wpcom from 'calypso/lib/wp';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import getSites from 'calypso/state/selectors/get-sites';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

// Initialize the editor blocks and text formatting.
loadBlocksWithCustomizations();
loadTextFormatting();

export default function QuickPost() {
	const translate = useTranslate();
	const locale = useLocale();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const [ postContent, setPostContent ] = useState( '' );
	const [ editorKey, setEditorKey ] = useState( 0 );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const sites = useSelector( getSites ).filter( ( site ): site is SiteDetails => site !== null );
	const hasLoaded = useSelector( hasLoadedSites );
	const [ selectedSiteId, setSelectedSiteId ] = useState< number | null >( null );
	const editorRef = useRef< HTMLDivElement >( null );
	const [ showSuccessMessage, setShowSuccessMessage ] = useState( false );

	// Set initial selected site once sites are loaded.
	useEffect( () => {
		if ( hasLoaded && sites.length > 0 && ! selectedSiteId ) {
			setSelectedSiteId( sites[ 0 ].ID );
		}
	}, [ hasLoaded, sites, selectedSiteId ] );

	const clearEditor = () => {
		setEditorKey( ( key ) => key + 1 );
	};

	const callShowSuccessMessage = () => {
		setShowSuccessMessage( true );
		setTimeout( () => {
			setShowSuccessMessage( false );
		}, 5000 );
	};

	const handleSubmit = () => {
		if ( ! postContent.trim() || ! selectedSiteId || isSubmitting ) {
			return;
		}

		setShowSuccessMessage( false );
		setIsSubmitting( true );

		wpcom
			.site( selectedSiteId )
			.post()
			.add( {
				title: postContent.split( '\n' )[ 0 ], // Use first line as title.
				content: postContent,
				status: 'publish',
			} )
			.then( () => {
				recordReaderTracksEvent( 'calypso_reader_quick_post_submitted' );
				clearEditor();
				callShowSuccessMessage();
				// TODO: Update the stream with the new post (if they're subscribed?) to signal success.
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

	const handleSiteChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setSelectedSiteId( Number( event.target.value ) );
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

	if ( ! sites.length ) {
		return null; // Don't show QuickPost if user has no sites.
	}

	const isDisabled = isSubmitting;

	return (
		<div className="quick-post-input">
			<label htmlFor="quick-post-site-select" className="quick-post-input__label">
				{ translate( 'Publish a post to' ) }
			</label>
			<div className="quick-post-input__fields">
				<FormSelect
					id="quick-post-site-select"
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
						key={ editorKey }
						initialContent=""
						onChange={ setPostContent }
						isRTL={ isLocaleRtl( locale ) ?? false }
						isDarkMode={ false }
					/>
				</div>
			</div>
			<div className="quick-post-input__actions">
				<div
					className={ `quick-post-input__success-message ${
						showSuccessMessage ? 'is-visible' : ''
					}` }
					aria-hidden={ ! showSuccessMessage }
				>
					<p>{ translate( 'Post successful! Your message will appear in the feed soon.' ) }</p>
				</div>

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
