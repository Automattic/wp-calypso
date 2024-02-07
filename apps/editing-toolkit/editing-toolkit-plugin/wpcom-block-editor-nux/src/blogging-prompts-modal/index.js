import { recordTracksEvent } from '@automattic/calypso-analytics';
import apiFetch from '@wordpress/api-fetch';
import { createBlock } from '@wordpress/blocks';
import { Button, Modal } from '@wordpress/components';
import { dispatch, select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

import './style.scss';

export const BloggingPromptsModalInner = () => {
	const [ isOpen, setIsOpen ] = useState( true );
	const [ prompts, setPrompts ] = useState( [] );
	const [ promptIndex, setPromptIndex ] = useState( 0 );

	useEffect( () => {
		const siteId = window._currentSiteId;
		const path = addQueryArgs( `/wpcom/v3/sites/${ siteId }/blogging-prompts`, {
			per_page: 10,
			after: moment().format( '--MM-DD' ),
			order: 'desc',
			force_year: new Date().getFullYear(),
		} );
		apiFetch( {
			path,
		} )
			.then( ( result ) => {
				recordTracksEvent( 'calypso_editor_writing_prompts_modal_viewed' );
				return setPrompts( result );
			} )
			// eslint-disable-next-line no-console
			.catch( () => console.error( 'Unable to fetch writing prompts' ) );
	}, [] );

	if ( ! isOpen || ! prompts.length ) {
		return null;
	}

	function selectPrompt() {
		const promptId = prompts[ promptIndex ]?.id;
		dispatch( 'core/editor' ).resetEditorBlocks( [
			createBlock( 'jetpack/blogging-prompt', { promptId } ),
		] );
		recordTracksEvent( 'calypso_editor_writing_prompts_modal_prompt_selected', {
			prompt_id: promptId,
		} );
		setIsOpen( false );
	}

	const closeModal = () => {
		recordTracksEvent( 'calypso_editor_writing_prompts_modal_closed' );
		setIsOpen( false );
	};

	return (
		<Modal
			onRequestClose={ closeModal }
			className="blogging-prompts-modal"
			title={ __( 'Some ideas for writing topics', 'full-site-editing' ) }
		>
			<div className="blogging-prompts-modal__prompt">
				<div className="blogging-prompts-modal__prompt-navigation">
					<Button
						onClick={ () => {
							if ( promptIndex - 1 < 0 ) {
								return setPromptIndex( prompts.length - 1 );
							}
							return setPromptIndex( promptIndex - 1 );
						} }
						aria-label={ __( 'Show previous prompt', 'full-site-editing' ) }
						variant="secondary"
						className="blogging-prompts-modal__prompt-navigation-button"
					>
						<ArrowLeftIcon />
					</Button>
					<h2 className="blogging-prompts-modal__prompt-text">{ prompts[ promptIndex ]?.text }</h2>
					<Button
						onClick={ () => setPromptIndex( ( promptIndex + 1 ) % prompts.length ) }
						aria-label={ __( 'Show next prompt', 'full-site-editing' ) }
						variant="secondary"
						className="blogging-prompts-modal__prompt-navigation-button"
					>
						<ArrowRightIcon />
					</Button>
				</div>
				<Button onClick={ selectPrompt } variant="secondary">
					{ __( 'Post Answer', 'full-site-editing' ) }
				</Button>
			</div>
		</Modal>
	);
};

export const BloggingPromptsModal = () => {
	const hasQueryArg = getQueryArg( window.location.href, 'new_prompt' );
	const editorType = select( 'core/editor' ).getCurrentPostType();

	const shouldOpen = hasQueryArg && editorType === 'post';

	if ( ! shouldOpen ) {
		return null;
	}
	return <BloggingPromptsModalInner />;
};
