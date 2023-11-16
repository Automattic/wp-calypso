import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import { navigate } from 'calypso/lib/navigate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import NoResponsesIcon from './no-responses-icon';
import './style.scss';

const PromptsNavigation = ( { siteId, prompts, tracksPrefix, index } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const editorUrl = useSelector( ( state ) => getEditorUrl( state, siteId ) );
	const backIcon = 'arrow-left';
	const forwardIcon = 'arrow-right';

	const initialIndex = index ? index % prompts.length : 0;
	const [ promptIndex, setPromptIndex ] = useState( initialIndex );

	const getPrompt = () => {
		return prompts ? prompts[ promptIndex ] : null;
	};

	// If no site ID set, go through site selector before rendering post editor
	const getNewPostLink = () =>
		addQueryArgs( siteId ? editorUrl : '/post', { answer_prompt: getPrompt()?.id } );

	const goToPreviousStep = () => {
		let nextIndex = promptIndex - 1;
		if ( nextIndex <= 1 ) {
			nextIndex = 0;
		}
		setPromptIndex( nextIndex );
	};

	const goToNextStep = () => {
		const maxIndex = prompts.length - 1;
		let nextIndex = promptIndex + 1;
		if ( nextIndex > maxIndex ) {
			nextIndex = maxIndex;
		}
		setPromptIndex( nextIndex );
	};

	const navigatePrompts = ( direction ) => {
		if ( direction === 'forward' ) {
			goToNextStep();
		} else {
			goToPreviousStep();
		}
	};

	const handleBloggingPromptClick = ( e ) => {
		// Prevent navigating away so we have time to record the click.
		e.preventDefault();

		if ( getPrompt()?.answered ) {
			return;
		}

		dispatch(
			recordTracksEvent( tracksPrefix + 'answer_prompt', {
				site_id: siteId,
				prompt_id: getPrompt()?.id,
			} )
		);

		// Track if a user skipped todays prompt and choose to answer another prompt
		const todayPromptId = prompts[ 0 ].id;
		const selectedPromptId = getPrompt()?.id;
		if ( todayPromptId !== selectedPromptId ) {
			dispatch(
				recordTracksEvent( tracksPrefix + 'skip_prompt', {
					site_id: siteId,
					prompt_id: todayPromptId,
				} )
			);
		}

		// Navigate to the editor.
		navigate( getNewPostLink() );
	};

	const trackClickViewAllResponses = () => {
		dispatch(
			recordTracksEvent( tracksPrefix + 'view_all_responses', {
				site_id: siteId,
				prompt_id: getPrompt()?.id,
			} )
		);
	};

	const trackBloganuaryMoreInfoClick = () => {
		dispatch(
			recordTracksEvent( tracksPrefix + 'bloganuary_more_info_click', {
				site_id: siteId,
				prompt_id: getPrompt()?.id,
			} )
		);
	};

	const renderPromptNavigation = () => {
		const buttonClasses = classnames( 'navigation-link' );

		return (
			<div className="blogging-prompt__prompt-navigation">
				<Button
					aria-label={ translate( 'Show previous prompt' ) }
					borderless={ false }
					className={ buttonClasses }
					onClick={ () => navigatePrompts( 'back' ) }
					disabled={ promptIndex === 0 }
				>
					<Gridicon icon={ backIcon } size={ 18 } />
				</Button>
				<div className="blogging-prompt__prompt-text">{ getPrompt()?.text }</div>
				<Button
					aria-label={ translate( 'Show next prompt' ) }
					borderless={ false }
					className={ buttonClasses }
					onClick={ () => navigatePrompts( 'forward' ) }
					disabled={ promptIndex >= prompts?.length - 1 }
				>
					<Gridicon icon={ forwardIcon } size={ 18 } />
				</Button>
			</div>
		);
	};

	const renderResponses = () => {
		const prompt = getPrompt();
		if ( ! prompt.answered_link ) {
			return null;
		}
		let responses = (
			<div className="blogging-prompt__prompt-no-response">
				<NoResponsesIcon />
				{ translate( 'Be the first to respond' ) }
			</div>
		);

		const link = new URL( prompt.answered_link );
		const relativeLink = link.toString().substring( link.origin.length );

		const viewAllResponses = (
			<a
				href={ relativeLink }
				className="blogging-prompt__prompt-responses-link"
				onClick={ trackClickViewAllResponses }
			>
				{ translate( 'View all responses' ) }
			</a>
		);

		if ( prompt?.answered_users_sample.length > 0 ) {
			responses = (
				<div className="blogging-prompt__prompt-responses">
					<div className="blogging-prompt__prompt-responses-users">
						{ prompt?.answered_users_sample.map( ( sample ) => {
							return <img alt="answered-users" src={ sample.avatar } key={ sample.avatar } />;
						} ) }
					</div>
					{ prompt?.answered_users_count > 0 ? viewAllResponses : '' }
				</div>
			);
		}

		return responses;
	};

	const renderPromptAnswer = () => {
		return (
			<div className="blogging-prompt__prompt-answers">
				{ renderResponses() }
				{ isBloganuary() && (
					<a
						href="https://wordpress.com/bloganuary"
						className="blogging-prompt__bloganuary-link"
						target="_blank"
						rel="noopener noreferrer"
						onClick={ trackBloganuaryMoreInfoClick }
					>
						{ translate( 'Learn more' ) }
					</a>
				) }
				<Button
					href={ getNewPostLink() }
					onClick={ handleBloggingPromptClick }
					className="blogging-prompt__new-post-link"
					disabled={ getPrompt()?.answered }
				>
					{ getPrompt()?.answered ? (
						<>
							<Gridicon icon="checkmark" size={ 18 } />
							{ translate( 'Answered' ) }
						</>
					) : (
						translate( 'Post Answer', {
							comment:
								'"Post" here is a verb meaning "to publish", as in "post an answer to this writing prompt"',
						} )
					) }
				</Button>
			</div>
		);
	};

	return (
		<div className="blogging-prompt__prompt-container">
			{ renderPromptNavigation() }
			{ renderPromptAnswer() }
		</div>
	);
};

export default PromptsNavigation;
