import apiFetch from '@wordpress/api-fetch';
import { createBlock } from '@wordpress/blocks';
import { Button, Modal } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState } from 'react';

export const BloggingPromptsModal = () => {
	const translate = useTranslate();
	const shouldOpen = getQueryArg( window.location.href, 'new_prompt' );
	const siteId = window._currentSiteId;
	const [ isOpen, setIsOpen ] = useState( shouldOpen );
	const [ prompts, setPrompts ] = useState( [] );
	const [ error, setError ] = useState( null );
	const [ promptIndex, setPromptIndex ] = useState( 0 );

	const path = addQueryArgs( `/wpcom/v3/sites/${ siteId }/blogging-prompts`, {
		per_page: 10,
		after: moment().format( '--MM-DD' ),
		order: 'desc',
		force_year: new Date().getFullYear(),
	} );

	function selectPrompt() {
		console.log( prompts[ promptIndex ] );
		dispatch( 'core/editor' ).resetEditorBlocks( [
			createBlock( 'jetpack/blogging-prompt', { promptId: prompts[ promptIndex ]?.id } ),
		] );
		setIsOpen( false );
	}

	useEffect( () => {
		apiFetch( {
			path,
		} )
			.then( ( result ) => {
				return setPrompts( result );
			} )
			.catch( ( err ) => setError( err ) );
	}, [] );

	if ( ! isOpen || ! prompts.length ) {
		return null;
	}

	return (
		<Modal onRequestClose={ () => setIsOpen( false ) }>
			<h1>{ translate( 'Here are some ideas for writing topics' ) }</h1>
			<h2>{ prompts[ promptIndex ]?.text }</h2>
			<Button onClick={ () => setPromptIndex( ( promptIndex + 1 ) % prompts.length ) } Secondary>
				{ translate( 'Next idea' ) }
			</Button>
			<Button onClick={ selectPrompt } Primary>
				{ translate( 'Select prompt' ) }
			</Button>
			<Button onClick={ () => setIsOpen( false ) } Primary>
				{ translate( 'No thanks' ) }
			</Button>
		</Modal>
	);
};
