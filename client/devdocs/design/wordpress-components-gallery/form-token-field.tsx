import { FormTokenField } from '@wordpress/components';
import { withState } from '@wordpress/compose';
import type { FormTokenField as FormTokenFieldType } from '@wordpress/components';

const FormTokenFieldExample = withState( {
	tokens: [],
	suggestions: [
		'Africa',
		'North America',
		'South America',
		'Antarctica',
		'Asia',
		'Europe',
		'Oceania',
	],
} )(
	( {
		tokens,
		suggestions,
		setState,
	}: {
		tokens: string[];
		suggestions: string[];
		setState: ( { tokens }: { tokens: readonly FormTokenFieldType.Value[] } ) => void;
	} ) => (
		<FormTokenField
			value={ tokens }
			suggestions={ suggestions }
			onChange={ ( nextTokens ) => setState( { tokens: nextTokens } ) }
		/>
	)
);

export default FormTokenFieldExample;
