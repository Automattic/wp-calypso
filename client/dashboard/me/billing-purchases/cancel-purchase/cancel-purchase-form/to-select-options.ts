import * as React from 'react';

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;
// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
type TranslateResult = ExistingReactNode;

type OptionLike = {
	label: TranslateResult;
	value: string | number;
};

export function toSelectOption( { label, value }: OptionLike ) {
	return {
		label: String( label ),
		value: String( value ),
		disabled: ! value,
	};
}
