import { FormTokenField } from '@wordpress/components';
import { withState } from '@wordpress/compose';

type TokenValue = React.ComponentProps< typeof FormTokenField >[ 'value' ];

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
		setState: ( { tokens }: { tokens: TokenValue } ) => void;
	} ) => (
		<FormTokenField
			value={ tokens }
			suggestions={ suggestions }
			onChange={ ( nextTokens ) => setState( { tokens: nextTokens } ) }
		/>
	)
);

export default FormTokenFieldExample;
