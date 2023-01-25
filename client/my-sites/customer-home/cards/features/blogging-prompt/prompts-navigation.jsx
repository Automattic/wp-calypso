import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import NoResponsesIcon from './no-responses-icon';
import './style.scss';

const PromptsNavigation = ( { prompts, showViewAllResponses = false } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const [ promptIndex, setPromptIndex ] = useState( 0 );
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const editorUrl = useSelector( ( state ) => getEditorUrl( state, siteId ) );
	const backIcon = 'arrow-left';
	const forwardIcon = 'arrow-right';

	const getPrompt = () => {
		return prompts !== undefined ? prompts[ promptIndex ] : null;
	};

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

	const trackBloggingPromptClick = () => {
		dispatch(
			recordTracksEvent( `calypso_customer_home_answer_prompt`, {
				site_id: siteId,
				prompt_id: getPrompt().id,
			} )
		);

		// Track if a user skipped todays prompt and choose to answer another prompt
		const todayPromptId = prompts[ 0 ].id;
		const skippedPromptId = getPrompt().id;
		if ( todayPromptId !== skippedPromptId ) {
			dispatch(
				recordTracksEvent( `calypso_customer_home_skip_prompt`, {
					site_id: siteId,
					prompt_id: skippedPromptId,
				} )
			);
		}
	};

	const trackClickViewAllResponses = () => {
		dispatch(
			recordTracksEvent( `calypso_customer_home_view_all_responses`, {
				site_id: siteId,
				prompt_id: getPrompt().id,
			} )
		);
	};

	const renderPromptNavigation = () => {
		const buttonClasses = classnames( 'navigation-link' );

		return (
			<div className="blogging-prompt__prompt-navigation">
				<Button
					borderless={ false }
					className={ buttonClasses }
					onClick={ () => navigatePrompts( 'back' ) }
					disabled={ promptIndex === 0 }
				>
					<Gridicon icon={ backIcon } size={ 18 } />
				</Button>
				<div className="blogging-prompt__prompt-text">{ getPrompt().text }</div>
				<Button
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
		let responses = (
			<div className="blogging-prompt__prompt-no-response">
				<NoResponsesIcon />
				{ translate( 'Be the first to respond' ) }
			</div>
		);

		const viewAllResponses = (
			<a
				href={ 'http://wordpress.com/tag/dailyprompt-' + prompt.id }
				target="_blank"
				rel="noreferrer"
				className="blogging-prompt__prompt-responses-link"
				onClick={ trackClickViewAllResponses }
			>
				{ translate( 'View all responses' ) }
			</a>
		);

		if ( prompt.answered_users_sample.length > 0 ) {
			responses = (
				<div className="blogging-prompt__prompt-responses">
					<div className="blogging-prompt__prompt-responses-users">
						{ prompt.answered_users_sample.map( ( sample ) => {
							return <img alt="answered-users" src={ sample.avatar } />;
						} ) }
					</div>
					{ showViewAllResponses ? viewAllResponses : '' }
				</div>
			);
		}

		return responses;
	};

	const renderPromptAnswer = () => {
		const newPostLink = addQueryArgs( editorUrl, {
			answer_prompt: getPrompt().id,
		} );
		return (
			<div className="blogging-prompt__prompt-answers">
				{ renderResponses() }
				<Button href={ newPostLink } onClick={ trackBloggingPromptClick() } target="_blank">
					{ translate( 'Post Answer', {
						comment:
							'"Post" here is a verb meaning "to publish", as in "post an answer to this writing prompt"',
					} ) }
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
