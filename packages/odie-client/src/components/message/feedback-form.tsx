import {
	useRateChat,
	useAuthenticateZendeskMessaging,
	getBadRatingReasons,
	isTestModeEnvironment,
} from '@automattic/zendesk-client';
import { Button, TextareaControl, SelectControl, Spinner } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message, MessageAction } from '../../types';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';

type FeedbackFormProps = {
	chatFeedbackOptions: MessageAction[];
};

export const FeedbackForm = ( { chatFeedbackOptions }: FeedbackFormProps ) => {
	const { isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const { __ } = useI18n();
	const [ score, setScore ] = useState< 'good' | 'bad' | '' >( '' );
	const [ comment, setComment ] = useState( '' );
	const [ reason, setReason ] = useState( '' );
	const [ isFormHidden, setIsFormHidden ] = useState( false );
	const { data: authData } = useAuthenticateZendeskMessaging(
		isUserEligibleForPaidSupport,
		'messenger'
	);
	const feedbackRef = useRef< HTMLDivElement | null >( null );
	const ticketId = useMemo( () => {
		if ( ! chatFeedbackOptions.length ) {
			return null;
		}
		return chatFeedbackOptions[ 0 ]?.metadata?.ticket_id ?? null;
	}, [ chatFeedbackOptions ] );
	const sendMessage = useSendChatMessage();

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
				content: score === 'good' ? __( 'Good 👍' ) : __( 'Bad 👎' ),
				payload: JSON.stringify( { csat_rating: score.toUpperCase() } ),
				metadata: { rated: true },
				role: 'user',
				type: 'message',
			};
		},
		[ __ ]
	);

	const postScore = useCallback(
		async ( score: 'good' | 'bad' ) => {
			if ( ! authData?.jwt || ! score ) {
				return;
			}

			setScore( score );
			await sendMessage( generateFeedbackMessage( score ) );
		},
		[ authData?.jwt, sendMessage, generateFeedbackMessage ]
	);

	const postCSAT = useCallback( async () => {
		if ( ! authData?.jwt || ! ticketId || ! score ) {
			return;
		}

		setIsFormHidden( true );

		if ( ! comment && ! reason ) {
			return;
		}

		await rateChat( {
			jwt: authData.jwt,
			ticket_id: ticketId,
			score,
			comment,
			reason_id: reason,
			test_mode: isTestModeEnvironment(),
		} );
	}, [ rateChat, authData?.jwt, ticketId, score, comment, reason ] );

	return (
		<>
			<div className={ clsx( 'odie-conversation__feedback', { has_message: score } ) }>
				<div className="odie-conversation-feedback__text">
					<p>{ __( 'Was this helpful?' ) }</p>
				</div>
				<div className="odie-conversation-feedback__thumbs">
					<Button onClick={ () => postScore( 'good' ) }>
						<ThumbsUpIcon />
					</Button>
					<Button onClick={ () => postScore( 'bad' ) }>
						<ThumbsDownIcon />
					</Button>
				</div>
			</div>
			{ score && (
				<>
					<div className="odie-rating-feedback-message">
						<div>{ score === 'good' ? __( 'Good 👍' ) : __( 'Bad 👎' ) }</div>
					</div>

					{ isSubmitting && (
						<div className="odie-conversation__feedback-loading">
							<Spinner />
						</div>
					) }

					{ ! isFormHidden && (
						<div ref={ feedbackRef } className="odie-conversation-feedback__message">
							<h3>{ __( 'Thank you for your input' ) }</h3>
							<p>
								{ __( 'Please share any other details that can help understand your rating.' ) }
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
								label={ score === 'bad' ? __( 'Additional Comments' ) : '' }
								__nextHasNoMarginBottom
								value={ comment }
								onChange={ ( value ) => setComment( value ) }
							/>

							<div>
								<Button variant="primary" onClick={ postCSAT } rel="noreferrer">
									{ __( 'Send' ) }
								</Button>

								<Button
									variant="tertiary"
									onClick={ () => setIsFormHidden( true ) }
									rel="noreferrer"
								>
									{ __( 'No thanks' ) }
								</Button>
							</div>
						</div>
					) }
				</>
			) }
		</>
	);
};
