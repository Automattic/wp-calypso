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
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message, MessageAction } from '../../types';
import { ThumbsDownIcon, ThumbsUpIcon } from './thumbs-icons';

type FeedbackFormProps = {
	chatFeedbackOptions: MessageAction[];
};

const generateFeedbackMessage = ( score: 'good' | 'bad' ): Message => {
	return {
		content: score === 'good' ? 'Good 👍' : 'Bad 👎',
		payload: JSON.stringify( { csat_rating: score.toUpperCase() } ),
		metadata: { rated: true },
		role: 'user',
		type: 'message',
	} as Message;
};

export const FeedbackForm = ( { chatFeedbackOptions }: FeedbackFormProps ) => {
	const { isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const user = Smooch.getUser();
	const { __ } = useI18n();
	const [ score, setScore ] = useState< 'good' | 'bad' | '' >( '' );
	const [ comment, setComment ] = useState( '' );
	const [ reason, setReason ] = useState( '' );
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

	const postCSAT = useCallback( async () => {
		if ( ! authData?.jwt || ! ticketId || ! score ) {
			return;
		}

		await sendMessage( generateFeedbackMessage( score ) );

		await rateChat( {
			jwt: authData.jwt,
			email: user.email,
			ticket_id: ticketId,
			score,
			comment,
			reason_id: reason,
			test_mode: isTestModeEnvironment(),
		} );
	}, [ rateChat, authData?.jwt, user.email, ticketId, score, comment, reason, sendMessage ] );

	if ( isSubmitting ) {
		return (
			<div className="odie-conversation__feedback-loading">
				<Spinner />
			</div>
		);
	}

	return (
		<>
			<div className={ clsx( 'odie-conversation__feedback', { has_message: score } ) }>
				<div className="odie-conversation-feedback__text">
					<p>{ __( 'Was this helpful?' ) }</p>
				</div>
				<div className="odie-conversation-feedback__thumbs">
					<Button onClick={ () => setScore( 'good' ) } rel="noreferrer">
						<ThumbsUpIcon />
					</Button>
					<Button onClick={ () => setScore( 'bad' ) } rel="noreferrer">
						<ThumbsDownIcon />
					</Button>
				</div>
			</div>
			{ score && (
				<div ref={ feedbackRef } className="odie-conversation-feedback__message">
					<TextareaControl
						__nextHasNoMarginBottom
						label={ __( 'Thank you for your input!' ) }
						help={ __( 'Please share any other details that can help understand your rating.' ) }
						value={ comment }
						onChange={ ( value ) => setComment( value ) }
					/>
					{ score && score === 'bad' && (
						<SelectControl
							className="odie-conversation-feedback__reason"
							label={ __( 'Reason' ) }
							value={ reason }
							options={ badRatingReasons }
							onChange={ ( reason ) => setReason( reason ) }
							__next40pxDefaultSize
						/>
					) }

					<Button variant="primary" onClick={ postCSAT } rel="noreferrer">
						{ __( 'Send' ) }
					</Button>

					<Button variant="secondary" onClick={ postCSAT } rel="noreferrer">
						{ __( 'No thanks' ) }
					</Button>
				</div>
			) }
		</>
	);
};
