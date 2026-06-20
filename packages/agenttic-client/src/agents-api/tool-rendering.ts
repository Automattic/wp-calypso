import { type ComponentType, createElement } from 'react';
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

function pickString(
	record: Record< string, unknown >,
	keys: string[]
): string {
	for ( const key of keys ) {
		const value = asString( record[ key ] );
		if ( value ) {
			return value;
		}
	}
	return '';
}

function pickBoolean(
	record: Record< string, unknown >,
	keys: string[]
): boolean | undefined {
	for ( const key of keys ) {
		if ( typeof record[ key ] === 'boolean' ) {
			return record[ key ] as boolean;
		}
	}
	return undefined;
}

function isQuestionChoice( value: unknown ): value is PresentQuestionChoice {
	return typeof asRecord( value ).label === 'string';
}

function normalizeStringArray( value: unknown ): string[] | undefined {
	if ( ! Array.isArray( value ) ) {
		return undefined;
	}

	const strings = value.filter(
		( item ): item is string => typeof item === 'string' && item !== ''
	);

	return strings.length ? strings : undefined;
}

function normalizeFontSample(
	value: unknown
): PresentQuestionChoiceFontSamplePresentation | undefined {
	const sample = asRecord( value );
	const normalized: PresentQuestionChoiceFontSamplePresentation = {};
	const heading = asString( sample.heading );
	const body = asString( sample.body );
	const headingFont = pickString( sample, [
		'heading_font',
		'headingFont',
		'headingfont',
	] );
	const bodyFont = pickString( sample, [
		'body_font',
		'bodyFont',
		'bodyfont',
	] );

	if ( heading ) {
		normalized.heading = heading;
	}
	if ( body ) {
		normalized.body = body;
	}
	if ( headingFont ) {
		normalized.heading_font = headingFont;
	}
	if ( bodyFont ) {
		normalized.body_font = bodyFont;
	}

	return Object.values( normalized ).some( Boolean ) ? normalized : undefined;
}

function normalizeImage(
	value: unknown
): PresentQuestionChoiceImagePresentation | undefined {
	const image = asRecord( value );
	const url = asString( image.url );

	if ( ! url ) {
		return undefined;
	}

	return {
		url,
		alt: asString( image.alt ) || undefined,
	};
}

function normalizePresentation(
	value: unknown
): PresentQuestionChoicePresentation | undefined {
	const presentation = asRecord( value );
	const normalized: PresentQuestionChoicePresentation = {};
	const swatches = normalizeStringArray( presentation.swatches );
	const fontSample = normalizeFontSample(
		presentation.font_sample ??
			presentation.fontSample ??
			presentation.fontsample
	);
	const image = normalizeImage( presentation.image );
	const layoutHint = pickString( presentation, [
		'layout_hint',
		'layoutHint',
		'layouthint',
	] );

	if ( swatches ) {
		normalized.swatches = swatches;
	}
	if ( fontSample ) {
		normalized.font_sample = fontSample;
	}
	if ( image ) {
		normalized.image = image;
	}
	if ( layoutHint ) {
		normalized.layout_hint = layoutHint;
	}

	return Object.values( normalized ).some( Boolean ) ? normalized : undefined;
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
	const presentation = normalizePresentation( choice.presentation );

	if ( message ) {
		normalized.message = message;
	}
	if ( description ) {
		normalized.description = description;
	}
	if ( presentation ) {
		normalized.presentation = presentation;
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
		? prompt.choices.flatMap( ( choice ) => {
				const normalized = normalizeChoice( choice );
				return normalized ? [ normalized ] : [];
		  } )
		: [];

	if ( ! question || choices.length === 0 ) {
		return null;
	}

	return {
		question,
		choices,
		allow_freeform: pickBoolean( prompt, [
			'allow_freeform',
			'allowFreeform',
			'allowfreeform',
		] ),
		freeform_label:
			pickString( prompt, [
				'freeform_label',
				'freeformLabel',
				'freeformlabel',
			] ) || undefined,
		freeform_placeholder:
			pickString( prompt, [
				'freeform_placeholder',
				'freeformPlaceholder',
				'freeformplaceholder',
			] ) || undefined,
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
