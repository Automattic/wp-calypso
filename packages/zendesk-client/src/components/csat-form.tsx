import { Button, TextareaControl, SelectControl, Spinner } from '@wordpress/components';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { useRateChat } from '../use-rate-chat';
import { getBadRatingReasons, isTestModeEnvironment } from '../util';
import { ThumbsDownIcon } from './thumbs-down-icon';
import { ThumbsUpIcon } from './thumbs-up-icon';
import './csat-form.scss';

export interface CSATFormProps {
	ticketId: number | null;
	onSendFeedback: ( score: 'good' | 'bad' ) => void;
	className?: string;
}

export const CSATForm = ( { ticketId, onSendFeedback, className }: CSATFormProps ) => {
	const [ score, setScore ] = useState< 'good' | 'bad' | '' >( '' );
	const [ comment, setComment ] = useState( '' );
	const [ reason, setReason ] = useState( '' );
	const [ isFormHidden, setIsFormHidden ] = useState( false );
	const feedbackRef = useRef< HTMLDivElement | null >( null );
	const badRatingReasons = getBadRatingReasons();

	const { isPending: isSubmitting, mutateAsync: rateChat } = useRateChat();

	useEffect( () => {
		if ( score && feedbackRef?.current ) {
			feedbackRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		}
	}, [ score ] );

	const postScore = useCallback(
		( selectedScore: 'good' | 'bad' ) => {
			setScore( selectedScore );
			onSendFeedback( selectedScore );
		},
		[ onSendFeedback ]
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
		<div className={ clsx( 'zendesk-csat-form', className ) }>
			<div className={ clsx( 'zendesk-csat-form__thumbs-container', { has_score: score } ) }>
				<div className="zendesk-csat-form__thumbs">
					<Button
						onClick={ () => postScore( 'good' ) }
						className="zendesk-csat-form__thumbs-button"
					>
						<ThumbsUpIcon />
					</Button>
					<Button onClick={ () => postScore( 'bad' ) } className="zendesk-csat-form__thumbs-button">
						<ThumbsDownIcon />
					</Button>
				</div>
			</div>
			{ score && (
				<>
					<div className="zendesk-csat-form__rating-message">
						<div>
							{ score === 'good'
								? __( 'Good 👍', '__i18n_text_domain__' )
								: __( 'Needs improvement 👎', '__i18n_text_domain__' ) }
						</div>
					</div>

					{ isSubmitting && (
						<div className="zendesk-csat-form__loading">
							<Spinner />
						</div>
					) }

					{ ! isFormHidden && (
						<div ref={ feedbackRef } className="zendesk-csat-form__feedback">
							<p>
								{ __(
									'Thank you for your input. Please share any details that can help us understand your rating.',
									'__i18n_text_domain__'
								) }
							</p>
							{ score === 'bad' && (
								<SelectControl
									className="zendesk-csat-form__reason"
									label={ __( 'Reason' ) }
									value={ reason }
									options={ badRatingReasons }
									onChange={ ( value ) => setReason( value ) }
									__next40pxDefaultSize
								/>
							) }

							<TextareaControl
								label={ score === 'bad' ? __( 'Additional Comments', '__i18n_text_domain__' ) : '' }
								__nextHasNoMarginBottom
								value={ comment }
								onChange={ ( value ) => setComment( value ) }
							/>

							<div>
								<Button variant="primary" onClick={ postCSAT }>
									{ __( 'Send', '__i18n_text_domain__' ) }
								</Button>

								<Button variant="tertiary" onClick={ () => setIsFormHidden( true ) }>
									{ __( 'No thanks', '__i18n_text_domain__' ) }
								</Button>
							</div>
						</div>
					) }
				</>
			) }
		</div>
	);
};
