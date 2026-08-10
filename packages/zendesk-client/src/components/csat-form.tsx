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
	onSendFeedback: ( score: 'good' | 'bad' ) => void | Promise< void >;
	/**
	 * When provided, the comment step submits through this callback instead of the
	 * ticket_id-based `/help/csat` endpoint. Used by callers rating something that isn't a
	 * Zendesk ticket satisfaction rating (e.g. a CSAT Survey Response).
	 */
	onSendComment?: (
		comment: string,
		reasonId: string,
		score: 'good' | 'bad'
	) => void | Promise< void >;
	/**
	 * Called once the form collapses after the responder submits (either "Send" or "No thanks").
	 */
	onFormHidden?: () => void;
	className?: string;
	preDeterminedScore?: 'good' | 'bad';
	/**
	 * The "Good 👍"/"Needs improvement 👎" message is hidden by default when preDeterminedScore
	 * is set, since some callers already show the score another way (e.g. a pressed button on a
	 * preceding message) and would otherwise show it twice. Set this to show it anyway.
	 */
	showRatingMessageWithPreDeterminedScore?: boolean;
}

export const CSATForm = ( {
	ticketId,
	preDeterminedScore,
	onSendFeedback,
	onSendComment,
	onFormHidden,
	className,
	showRatingMessageWithPreDeterminedScore,
}: CSATFormProps ) => {
	const [ score, setScore ] = useState( preDeterminedScore );
	const [ comment, setComment ] = useState( '' );
	const [ reason, setReason ] = useState( '' );
	const [ isFormHidden, setIsFormHidden ] = useState( false );
	const [ isSubmittingComment, setIsSubmittingComment ] = useState( false );
	const [ isSubmittingScore, setIsSubmittingScore ] = useState( false );
	// A ref alongside the state above: two clicks fired before the first re-render commits would
	// both still see the pre-click `isSubmittingScore` value from state, so the state alone can't
	// block a fast double-click. The ref updates synchronously and is shared across both closures.
	const isSubmittingScoreRef = useRef( false );
	const feedbackRef = useRef< HTMLDivElement | null >( null );
	const badRatingReasons = getBadRatingReasons();

	const { isPending: isSubmittingRateChat, mutateAsync: rateChat } = useRateChat();
	const isSubmitting = isSubmittingRateChat || isSubmittingComment || isSubmittingScore;

	useEffect( () => {
		if ( score && feedbackRef?.current ) {
			feedbackRef.current.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		}
	}, [ score ] );

	const postScore = useCallback(
		async ( selectedScore: 'good' | 'bad' ) => {
			if ( isSubmittingScoreRef.current ) {
				return;
			}

			isSubmittingScoreRef.current = true;
			setIsSubmittingScore( true );
			setScore( selectedScore );

			try {
				await onSendFeedback( selectedScore );
			} finally {
				isSubmittingScoreRef.current = false;
				setIsSubmittingScore( false );
			}
		},
		[ onSendFeedback ]
	);

	const hideForm = useCallback( () => {
		setIsFormHidden( true );
		onFormHidden?.();
	}, [ onFormHidden ] );

	const postCSAT = useCallback( async () => {
		if ( ! score ) {
			return;
		}

		hideForm();
		if ( ! comment && ! reason ) {
			return;
		}

		if ( onSendComment ) {
			setIsSubmittingComment( true );
			try {
				await onSendComment( comment, reason, score );
			} finally {
				setIsSubmittingComment( false );
			}
			return;
		}

		if ( ! ticketId ) {
			return;
		}

		await rateChat( {
			ticket_id: ticketId,
			score,
			comment,
			reason_id: reason,
			test_mode: isTestModeEnvironment(),
		} );
	}, [ rateChat, ticketId, score, comment, reason, onSendComment, hideForm ] );

	return (
		<div className={ clsx( 'zendesk-csat-form', className ) }>
			{ ! preDeterminedScore && (
				<div className={ clsx( 'zendesk-csat-form__thumbs-container', { has_score: score } ) }>
					<div className="zendesk-csat-form__thumbs">
						<Button
							onClick={ () => postScore( 'good' ) }
							className="zendesk-csat-form__thumbs-button"
							disabled={ isSubmittingScore }
						>
							<ThumbsUpIcon />
						</Button>
						<Button
							onClick={ () => postScore( 'bad' ) }
							className="zendesk-csat-form__thumbs-button"
							disabled={ isSubmittingScore }
						>
							<ThumbsDownIcon />
						</Button>
					</div>
				</div>
			) }
			{ isSubmitting && (
				<div className="zendesk-csat-form__loading">
					<Spinner />
				</div>
			) }
			{ score && (
				<>
					{ ( ! preDeterminedScore || showRatingMessageWithPreDeterminedScore ) && (
						<div className="zendesk-csat-form__rating-message">
							<div>
								{ score === 'good'
									? __( 'Good 👍', '__i18n_text_domain__' )
									: __( 'Needs improvement 👎', '__i18n_text_domain__' ) }
							</div>
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

								<Button variant="tertiary" onClick={ hideForm }>
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
