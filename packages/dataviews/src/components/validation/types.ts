import { ValidationContext } from '../../types';
import { INPUT_VALIDATION_RULES } from './constant';

export type RequiredRule = {
	[ INPUT_VALIDATION_RULES.isRequired ]: boolean;
};

export type Rules< Item > = RequiredRule;

export type NormalizedRule< Item > = (
	item: Item,
	context?: ValidationContext
) => boolean | string;
