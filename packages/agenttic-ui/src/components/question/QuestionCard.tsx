import { type CSSProperties, type FormEvent, useId, useState } from 'react';
import type {
	QuestionChoice,
	QuestionChoiceFontSamplePresentation,
	QuestionChoicePresentation,
	QuestionPrompt,
} from '../../types';
import { cn } from '../../utils/classNames';
import styles from './QuestionCard.module.css';

export interface QuestionCardProps {
	prompt: QuestionPrompt;
	onAnswer: (
		answer: string,
		choice: QuestionChoice
	) => void | Promise< void >;
	disabled?: boolean;
	answered?: boolean;
	answeredChoice?: string;
	className?: string;
}

function renderSwatches( swatches?: string[] ) {
	if ( ! swatches?.length ) {
		return null;
	}

	return (
		<div
			className={ styles.swatches }
			data-slot="swatches"
			aria-label="Color swatches"
		>
			{ swatches.map( ( swatch, index ) => (
				<span
					key={ `${ swatch }-${ index }` }
					className={ styles.swatch }
					data-slot="swatch"
					style={ { background: swatch } }
					title={ swatch }
				/>
			) ) }
		</div>
	);
}

function renderFontSample( fontSample?: QuestionChoiceFontSamplePresentation ) {
	if ( ! fontSample ) {
		return null;
	}

	const headingStyle: CSSProperties | undefined = fontSample.heading_font
		? { fontFamily: fontSample.heading_font }
		: undefined;
	const bodyStyle: CSSProperties | undefined = fontSample.body_font
		? { fontFamily: fontSample.body_font }
		: undefined;

	return (
		<div className={ styles.fontSample } data-slot="font-sample">
			{ fontSample.heading ? (
				<p
					className={ styles.fontHeading }
					data-slot="font-heading"
					style={ headingStyle }
				>
					{ fontSample.heading }
				</p>
			) : null }
			{ fontSample.body ? (
				<p
					className={ styles.fontBody }
					data-slot="font-body"
					style={ bodyStyle }
				>
					{ fontSample.body }
				</p>
			) : null }
		</div>
	);
}

function renderPresentation( presentation?: QuestionChoicePresentation ) {
	if ( ! presentation ) {
		return null;
	}

	const hasPresentation =
		presentation.swatches?.length ||
		presentation.font_sample ||
		presentation.image ||
		presentation.layout_hint;

	if ( ! hasPresentation ) {
		return null;
	}

	return (
		<div className={ styles.presentation } data-slot="presentation">
			{ presentation.image ? (
				<img
					className={ styles.image }
					data-slot="image"
					src={ presentation.image.url }
					alt={ presentation.image.alt ?? '' }
				/>
			) : null }
			{ renderSwatches( presentation.swatches ) }
			{ renderFontSample( presentation.font_sample ) }
			{ presentation.layout_hint ? (
				<div className={ styles.layoutHint } data-slot="layout-hint">
					{ presentation.layout_hint }
				</div>
			) : null }
		</div>
	);
}

export function QuestionCard( {
	prompt,
	onAnswer,
	disabled = false,
	answered = false,
	answeredChoice,
	className,
}: QuestionCardProps ) {
	const controlsDisabled = disabled || answered;
	const [ freeformAnswer, setFreeformAnswer ] = useState( '' );
	const freeformInputId = useId();
	const freeformChoice: QuestionChoice = {
		label: prompt.freeform_label ?? 'Type your own answer',
	};

	function submitFreeformAnswer( event: FormEvent< HTMLFormElement > ) {
		event.preventDefault();
		const answer = freeformAnswer.trim();

		if ( ! answer ) {
			return;
		}

		onAnswer( answer, freeformChoice );
	}

	return (
		<section
			className={ cn( styles.card, className ) }
			data-agenttic-question-card
			data-slot="card"
		>
			<p className={ styles.question } data-slot="question">
				{ prompt.question }
			</p>
			<div className={ styles.choices } data-slot="choices">
				{ prompt.choices.map( ( choice, index ) => {
					const answer = choice.message ?? choice.label;
					const isAnsweredChoice = answeredChoice === answer;

					return (
						<button
							key={ `${ choice.label }-${ index }` }
							type="button"
							data-slot="choice"
							className={ cn(
								styles.choice,
								isAnsweredChoice ? styles.answered : undefined
							) }
							disabled={ controlsDisabled }
							aria-pressed={ isAnsweredChoice || undefined }
							onClick={ () => onAnswer( answer, choice ) }
						>
							<span className={ styles.label } data-slot="label">
								{ choice.label }
							</span>
							{ choice.description ? (
								<span
									className={ styles.description }
									data-slot="description"
								>
									{ choice.description }
								</span>
							) : null }
							{ renderPresentation( choice.presentation ) }
						</button>
					);
				} ) }
			</div>
			{ prompt.allow_freeform ? (
				<form
					className={ styles.freeform }
					data-slot="freeform"
					onSubmit={ submitFreeformAnswer }
				>
					<label
						htmlFor={ freeformInputId }
						className={ styles.freeformLabel }
						data-slot="freeform-label"
					>
						<span>{ freeformChoice.label }</span>
						<input
							id={ freeformInputId }
							className={ styles.freeformInput }
							data-slot="freeform-input"
							type="text"
							value={ freeformAnswer }
							disabled={ controlsDisabled }
							placeholder={ prompt.freeform_placeholder }
							onChange={ ( event ) =>
								setFreeformAnswer( event.currentTarget.value )
							}
						/>
					</label>
					<button
						type="submit"
						className={ styles.freeformSubmit }
						data-slot="freeform-submit"
						disabled={ controlsDisabled || ! freeformAnswer.trim() }
					>
						Submit
					</button>
				</form>
			) : null }
		</section>
	);
}
