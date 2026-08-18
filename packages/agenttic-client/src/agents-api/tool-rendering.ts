import { type ComponentType, createElement } from 'react';
import type { AgentsApiToolGroup, AgentsApiToolRenderers } from './types';

export { groupToolMessages, renderToolGroups } from './normalizer';
export type { AgentsApiToolGroup, AgentsApiToolRenderers } from './types';

const PRESENT_QUESTION_TOOL_NAME = 'present_question';

export interface PresentQuestionChoice {
	label: string;
	message?: string;
	description?: string;
	presentation?: unknown;
}

export interface PresentQuestionPrompt {
	question: string;
	choices: PresentQuestionChoice[];
}

export interface PresentQuestionCardProps {
	prompt: PresentQuestionPrompt;
	onAnswer: (
		answer: string,
		choice: PresentQuestionChoice
	) => void | Promise< void >;
	disabled?: boolean;
	answered?: boolean;
	answeredChoice?: string;
	className?: string;
}

function asRecord( value: unknown ): Record< string, unknown > {
	return value && typeof value === 'object'
		? ( value as Record< string, unknown > )
		: {};
}

function asString( value: unknown ): string {
	return typeof value === 'string' ? value : '';
}

function isQuestionChoice( value: unknown ): value is PresentQuestionChoice {
	return typeof asRecord( value ).label === 'string';
}

function normalizeChoice( value: unknown ): PresentQuestionChoice | null {
	if ( ! isQuestionChoice( value ) ) {
		return null;
	}

	const choice = asRecord( value );
	const normalized: PresentQuestionChoice = {
		label: asString( choice.label ),
	};
	const message = asString( choice.message );
	const description = asString( choice.description );

	if ( message ) {
		normalized.message = message;
	}
	if ( description ) {
		normalized.description = description;
	}
	if ( choice.presentation !== undefined ) {
		normalized.presentation = choice.presentation;
	}

	return normalized;
}

export function normalizePresentQuestionPrompt(
	input: unknown
): PresentQuestionPrompt | null {
	const value = asRecord( input );
	const result = asRecord( value.result );
	const payload =
		asString( result.question ) || Array.isArray( result.choices )
			? result
			: value;
	const prompt = asRecord(
		payload.prompt ??
			payload.question_prompt ??
			payload.questionPrompt ??
			payload
	);
	const question = asString( prompt.question );
	const choices = Array.isArray( prompt.choices )
		? prompt.choices
				.flatMap( ( choice ) => {
					const normalized = normalizeChoice( choice );
					return normalized ? [ normalized ] : [];
				} )
				.slice( 0, 4 )
		: [];

	if ( ! question || choices.length === 0 ) {
		return null;
	}

	return {
		question,
		choices,
	};
}

export interface PresentQuestionRendererOptions {
	QuestionCard: ComponentType< PresentQuestionCardProps >;
	onAnswer: (
		answer: string,
		choice: PresentQuestionChoice,
		group: AgentsApiToolGroup
	) => void | Promise< void >;
	disabled?: boolean | ( ( group: AgentsApiToolGroup ) => boolean );
	answered?: boolean | ( ( group: AgentsApiToolGroup ) => boolean );
	answeredChoice?:
		| string
		| ( ( group: AgentsApiToolGroup ) => string | undefined );
}

function resolveOption< T >(
	value: T | ( ( group: AgentsApiToolGroup ) => T ),
	group: AgentsApiToolGroup
): T {
	return typeof value === 'function'
		? ( value as ( group: AgentsApiToolGroup ) => T )( group )
		: value;
}

export function createPresentQuestionRenderer( {
	QuestionCard,
	onAnswer,
	disabled = false,
	answered = false,
	answeredChoice,
}: PresentQuestionRendererOptions ): AgentsApiToolRenderers[ string ] {
	return ( group ) => {
		const prompt = normalizePresentQuestionPrompt(
			group.result?.result ?? group.call?.args
		);

		if ( ! prompt ) {
			return null;
		}

		return createElement( QuestionCard, {
			prompt,
			disabled: resolveOption( disabled, group ),
			answered: resolveOption( answered, group ),
			answeredChoice:
				answeredChoice === undefined
					? undefined
					: resolveOption( answeredChoice, group ),
			onAnswer: ( answer, choice ) => onAnswer( answer, choice, group ),
		} );
	};
}

export function createPresentQuestionToolRenderers(
	options: PresentQuestionRendererOptions
): AgentsApiToolRenderers {
	return {
		[ PRESENT_QUESTION_TOOL_NAME ]:
			createPresentQuestionRenderer( options ),
	};
}
