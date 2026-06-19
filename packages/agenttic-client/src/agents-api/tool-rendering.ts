import { createElement, type ComponentType } from 'react';
import { groupToolMessages, renderToolGroups } from './normalizer';
import type { AgentsApiToolGroup, AgentsApiToolRenderers } from './types';

export { groupToolMessages, renderToolGroups } from './normalizer';
export type { AgentsApiToolGroup, AgentsApiToolRenderers } from './types';

const PRESENT_QUESTION_TOOL_NAME = 'present_question';

export interface PresentQuestionChoiceFontSamplePresentation {
	heading?: string;
	body?: string;
	heading_font?: string;
	body_font?: string;
}

export interface PresentQuestionChoiceImagePresentation {
	url: string;
	alt?: string;
}

export interface PresentQuestionChoicePresentation {
	swatches?: string[];
	font_sample?: PresentQuestionChoiceFontSamplePresentation;
	image?: PresentQuestionChoiceImagePresentation;
	layout_hint?: string;
}

export interface PresentQuestionChoice {
	label: string;
	message?: string;
	description?: string;
	presentation?: PresentQuestionChoicePresentation;
}

export interface PresentQuestionPrompt {
	question: string;
	choices: PresentQuestionChoice[];
	allow_freeform?: boolean;
	freeform_label?: string;
	freeform_placeholder?: string;
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

export function normalizePresentQuestionPrompt(
	input: unknown
): PresentQuestionPrompt | null {
	const value = asRecord( input );
	const prompt = asRecord( value.prompt ?? value.question_prompt ?? value );
	const question = asString( prompt.question );
	const choices = Array.isArray( prompt.choices )
		? prompt.choices.filter( isQuestionChoice )
		: [];

	if ( ! question || choices.length === 0 ) {
		return null;
	}

	return {
		question,
		choices,
		allow_freeform:
			typeof prompt.allow_freeform === 'boolean'
				? prompt.allow_freeform
				: undefined,
		freeform_label: asString( prompt.freeform_label ) || undefined,
		freeform_placeholder:
			asString( prompt.freeform_placeholder ) || undefined,
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
