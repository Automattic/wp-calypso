/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { LoadingPlaceholder } from '@automattic/components';
import { HelpCenterSelect } from '@automattic/data-stores';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import stripTags from 'striptags';
import './help-center-article-content.scss';
import { useJetpackSearchAIQuery } from '../data/use-jetpack-search-ai';
import { useTyper } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import type { JetpackSearchAIResult } from '../data/use-jetpack-search-ai';

const GPTResponsePlaceholder = styled( LoadingPlaceholder )< { width?: string } >`
	:not( :last-child ) {
		margin-block-end: 0.5rem;
	}
	width: ${ ( { width = '100%' } ) => width };
`;

const GPTResponseDisclaimer = styled.div`
	color: var( --studio-gray-50 );
	font-size: 11px;
	text-align: right;

	@media ( min-width: 600px ) {
		padding: 0 0 15px;
	}
`;

interface LoadingPlaceholderProps {
	loadingMessage: string;
}

const LoadingPlaceholders: React.FC< LoadingPlaceholderProps > = ( { loadingMessage } ) => (
	<>
		<p className="help-center-gpt-response__loading">{ loadingMessage }</p>
		<GPTResponsePlaceholder width="80%" />
		<GPTResponsePlaceholder width="80%" />
		<GPTResponsePlaceholder width="55%" />
	</>
);

interface Props {
	onResponseReceived: ( response: JetpackSearchAIResult ) => void;
}

export function HelpCenterGPT( { onResponseReceived }: Props ) {
	const { __ } = useI18n();

	const [ feedbackGiven, setFeedbackGiven ] = useState< boolean >( false );

	// Report loading state up.
	const { message } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		const subject = store.getSubject() || '';
		const message = store.getMessage();

		// if the first 50 chars of subject and message match, only show the message (they're probably identical)
		if ( subject && message && subject.slice( 0, 50 ) !== message.slice( 0, 50 ) ) {
			return {
				message: `${ subject }\n\n${ message }`,
			};
		}

		return {
			message,
		};
	}, [] );

	const query = message ?? '';

	const { data, isError: isGPTError } = useJetpackSearchAIQuery( {
		siteId: '9619154',
		query: query,
		stopAt: 'response',
		enabled: true,
	} );

	const allowedTags = [ 'a', 'p', 'ol', 'ul', 'li', 'br', 'b', 'strong', 'i', 'em' ];

	useEffect( () => {
		if ( data?.response ) {
			recordTracksEvent( 'calypso_helpcenter_show_gpt_response', {
				location: 'help-center',
				answer_source: data?.source,
			} );

			onResponseReceived( data );
		}
	}, [ data ] );

	const loadingMessages: string[] = [
		__( 'Finding relevant support documentation…', __i18n_text_domain__ ),
		__( 'Gathering all the data…', __i18n_text_domain__ ),
		__( 'Thanks for your patience, this might take a bit…', __i18n_text_domain__ ),
		__( 'Processing the information found…', __i18n_text_domain__ ),
		__( "I'm still writing, thank you for your patience!", __i18n_text_domain__ ),
		__( 'Any minute now…', __i18n_text_domain__ ),
		__( 'Really, any minute now…', __i18n_text_domain__ ),
	];

	const loadingMessage = useTyper( loadingMessages, ! data?.response, {
		delayBetweenCharacters: 80,
		delayBetweenPhrases: 1400,
	} );

	const doThumbsUp = ( source: string ) => {
		return () => {
			setFeedbackGiven( true );
			recordTracksEvent( 'calypso_helpcenter_gpt_response_thumbs_up', {
				location: 'help-center',
				answer_source: source,
			} );
		};
	};

	const doThumbsDown = ( source: string ) => {
		return () => {
			setFeedbackGiven( true );
			recordTracksEvent( 'calypso_helpcenter_gpt_response_thumbs_down', {
				location: 'help-center',
				answer_source: source,
			} );
		};
	};

	return (
		<div className="help-center-gpt__container">
			<h1 id="help-center--contextual_help" className="help-center__section-title">
				{ __( 'Quick response:', __i18n_text_domain__ ) }
			</h1>
			{ isGPTError && (
				<div className="help-center-gpt-error">
					{ __(
						"Sorry, we couldn't load the AI-generated response. Please click the button below to send your message to our support team.",
						__i18n_text_domain__
					) }
				</div>
			) }
			{ ! isGPTError && (
				<>
					<div className="help-center-gpt-response">
						{ ! data?.response && (
							<>
								<p>
									{ __(
										'Our system is currently generating a possible solution for you, which typically takes about 30 seconds.',
										__i18n_text_domain__
									) }
								</p>
								<p>
									{ createInterpolateElement(
										sprintf(
											/* translators: the cancelButtonLabel is the already translated "Cancel" button label */
											__(
												'We know your time is valuable. If you prefer not to wait, you can click the <em>%(cancelButtonLabel)s</em> button below to go back and submit your message right away.'
											),
											{ cancelButtonLabel: __( 'Cancel', __i18n_text_domain__ ) }
										),
										{
											em: createElement( 'em' ),
										}
									) }
								</p>
							</>
						) }
						{ ! data?.response && LoadingPlaceholders( { loadingMessage } ) }
						{ data?.response && (
							<>
								<div
									className="help-center-gpt-response__content"
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={ {
										__html: stripTags( data.response, allowedTags ),
									} }
								/>
								<div className="help-center-gpt-response__actions">
									{ feedbackGiven ? (
										<div className="help-center-gpt-response__feedback">
											{ __(
												'Thank you for your feedback! We will use it to improve our AI.',
												__i18n_text_domain__
											) }
										</div>
									) : (
										<>
											<Button onClick={ doThumbsUp( data?.source ) }>&#128077;</Button>
											<Button onClick={ doThumbsDown( data?.source ) }>&#128078;</Button>
										</>
									) }
								</div>
								<GPTResponseDisclaimer>
									{ __(
										"Generated by WordPress.com's Support AI. Please be advised, that AI-generated content can be inaccurate or biased.",
										__i18n_text_domain__
									) }
								</GPTResponseDisclaimer>
								<div className="help-center-gpt-response__continue">
									<p>
										{ createInterpolateElement(
											__(
												'<strong>Need more help?</strong> Click the button below to send your message. For reference, here is what you wrote:',
												__i18n_text_domain__
											),
											{
												strong: createElement( 'strong' ),
											}
										) }
									</p>
									<div className="help-center-gpt-response__continue_quote">
										{ query.split( '\n\n' ).map( ( line, index ) => (
											<p key={ index }>{ line }</p>
										) ) }
									</div>
								</div>
							</>
						) }
					</div>
				</>
			) }
		</div>
	);
}
