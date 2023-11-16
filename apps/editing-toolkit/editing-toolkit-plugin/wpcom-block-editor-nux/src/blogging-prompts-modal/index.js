import { Gridicon } from '@automattic/components';
import apiFetch from '@wordpress/api-fetch';
import { createBlock } from '@wordpress/blocks';
import { Button, Modal } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { addQueryArgs, getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState } from 'react';

import './style.scss';

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
		<Modal
			onRequestClose={ () => setIsOpen( false ) }
			className="blogging-prompts-modal"
			title={ translate( 'Some ideas for writing topics' ) }
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
						aria-label={ translate( 'Show previous prompt' ) }
						variant="secondary"
						className="blogging-prompts-modal__prompt-navigation-button"
					>
						<Gridicon icon="arrow-left" size={ 18 } />
					</Button>
					<h2 className="blogging-prompts-modal__prompt-text">{ prompts[ promptIndex ]?.text }</h2>
					<Button
						onClick={ () => setPromptIndex( ( promptIndex + 1 ) % prompts.length ) }
						aria-label={ translate( 'Show next prompt' ) }
						variant="secondary"
						className="blogging-prompts-modal__prompt-navigation-button"
					>
						<Gridicon icon="arrow-right" size={ 18 } />
					</Button>
				</div>
				<Button onClick={ selectPrompt } variant="secondary">
					{ translate( 'Post Answer' ) }
				</Button>
			</div>
		</Modal>
	);
};
