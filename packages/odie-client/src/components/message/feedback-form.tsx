import {
	useRateChat,
	getBadRatingReasons,
	isTestModeEnvironment,
} from '@automattic/zendesk-client';
import { Button, TextareaControl, SelectControl, Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSendZendeskMessageOnce } from '../../hooks';
import { Message, MessageAction } from '../../types';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';

type FeedbackFormProps = {
	chatFeedbackOptions: MessageAction[];
};

export const FeedbackForm = ( { chatFeedbackOptions }: FeedbackFormProps ) => {
	const { __ } = useI18n();
	const [ score, setScore ] = useState< 'good' | 'bad' | '' >( '' );
	const [ comment, setComment ] = useState( '' );
	const [ reason, setReason ] = useState( '' );
	const [ isFormHidden, setIsFormHidden ] = useState( false );
	const feedbackRef = useRef< HTMLDivElement | null >( null );
	const ticketId = useMemo( () => {
		if ( ! chatFeedbackOptions.length ) {
			return null;
		}
		return chatFeedbackOptions[ 0 ]?.metadata?.ticket_id ?? null;
	}, [ chatFeedbackOptions ] );
	const sendZendeskMessage = useSendZendeskMessageOnce();
	const badRatingReasons = getBadRatingReasons();

	const { isPending: isSubmitting, mutateAsync: rateChat } = useRateChat();

	useEffect( () => {
		if ( score && feedbackRef?.current ) {
			feedbackRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		}
	}, [ score ] );

	const generateFeedbackMessage = useCallback(
		( score: 'good' | 'bad' ): Message => {
			return {
				content:
					score === 'good'
						? __( 'Good 👍', __i18n_text_domain__ )
						: __( 'Bad 👎', __i18n_text_domain__ ),
				payload: JSON.stringify( { csat_rating: score.toUpperCase() } ),
				metadata: {
					rated: true,
					temporary_id: crypto.randomUUID(),
					local_timestamp: Date.now() / 1000,
				},
				role: 'user',
				type: 'message',
			};
		},
		[ __ ]
	);

	const postScore = useCallback(
		async ( score: 'good' | 'bad' ) => {
			if ( ! score ) {
				return;
			}

			setScore( score );
			sendZendeskMessage( generateFeedbackMessage( score ) );
		},
		[ sendZendeskMessage, generateFeedbackMessage ]
	);

	const postCSAT = useCallback( async () => {
		if ( ! ticketId || ! score ) {
			return;
		}

		setIsFormHidden( true );

		if ( ! comment && ! reason ) {
			return;
		}

		await rateChat( {
			ticket_id: ticketId,
			score,
			comment,
			reason_id: reason,
			test_mode: isTestModeEnvironment(),
		} );
	}, [ rateChat, ticketId, score, comment, reason ] );

	return (
		<>
			<div className={ clsx( 'odie-conversation__feedback', { has_message: score } ) }>
				<div className="odie-conversation-feedback__thumbs">
					<Button
						onClick={ () => postScore( 'good' ) }
						className="odie-conversation-feedback__thumbs-button"
					>
						<ThumbsUpIcon />
					</Button>
					<Button
						onClick={ () => postScore( 'bad' ) }
						className="odie-conversation-feedback__thumbs-button"
					>
						<ThumbsDownIcon />
					</Button>
				</div>
			</div>
			{ score && (
				<>
					<div className="odie-rating-feedback-message">
						<div>
							{ score === 'good'
								? __( 'Good 👍', __i18n_text_domain__ )
								: __( 'Bad 👎', __i18n_text_domain__ ) }
						</div>
					</div>

					{ isSubmitting && (
						<div className="odie-conversation__feedback-loading">
							<Spinner />
						</div>
					) }

					{ ! isFormHidden && (
						<div ref={ feedbackRef } className="odie-conversation-feedback__message">
							<h3>{ __( 'Thank you for your input', __i18n_text_domain__ ) }</h3>
							<p>
								{ __(
									'Please share any details that can help us understand your rating',
									__i18n_text_domain__
								) }
							</p>
							{ score === 'bad' && (
								<SelectControl
									className="odie-conversation-feedback__reason"
									label={ __( 'Reason' ) }
									value={ reason }
									options={ badRatingReasons }
									onChange={ ( reason ) => setReason( reason ) }
									__next40pxDefaultSize
								/>
							) }

							<TextareaControl
								label={ score === 'bad' ? __( 'Additional Comments', __i18n_text_domain__ ) : '' }
								__nextHasNoMarginBottom
								value={ comment }
								onChange={ ( value ) => setComment( value ) }
							/>

							<div>
								<Button variant="primary" onClick={ postCSAT } rel="noreferrer">
									{ __( 'Send', __i18n_text_domain__ ) }
								</Button>

								<Button
									variant="tertiary"
									onClick={ () => setIsFormHidden( true ) }
									rel="noreferrer"
								>
									{ __( 'No thanks', __i18n_text_domain__ ) }
								</Button>
							</div>
						</div>
					) }
				</>
			) }
		</>
	);
};
