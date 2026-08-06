import { type ReactNode } from 'react';
import type { QuestionChoice, QuestionPrompt } from '../../types';
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
	renderChoiceContent?: ( choice: QuestionChoice ) => ReactNode;
}

export function QuestionCard( {
	prompt,
	onAnswer,
	disabled = false,
	answered = false,
	answeredChoice,
	className,
	renderChoiceContent,
}: QuestionCardProps ) {
	const controlsDisabled = disabled || answered;
	const choices = prompt.choices.slice( 0, 4 );

	return (
		<section
			className={ cn( styles.card, className ) }
			data-agenttic-question-card
			data-slot="card"
		>
			<p className={ styles.question } data-slot="question">
				{ prompt.question }
			</p>
			<div
				className={ cn(
					styles.choices,
					choices.length === 4 ? styles.choicesGrid : undefined
				) }
				data-slot="choices"
			>
				{ choices.map( ( choice, index ) => {
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
							{ renderChoiceContent?.( choice ) }
						</button>
					);
				} ) }
			</div>
		</section>
	);
}
