export const PORTFOLIO_DIRECTIONS = [
	{
		value: 'sites',
		label: 'Round 2',
		variants: [
			{ value: 'sites-list', label: 'Sites list' },
			{ value: 'sites-grid', label: 'Sites grid' },
			{ value: 'sites-lens', label: 'Magnifier' },
			{ value: 'keyring', label: 'Keyring' },
		],
	},
	{
		value: 'nodes',
		label: 'Connected nodes',
		variants: [
			{ value: 'connected', label: 'Orbit · 12' },
			{ value: 'branches', label: 'Branches · 16' },
			{ value: 'clusters', label: 'Clusters · 16' },
			{ value: 'constellation', label: 'Freeform · 18' },
		],
	},
	{
		value: 'folios',
		label: 'Client folios',
		variants: [
			{ value: 'fan', label: 'Fan · 7' },
			{ value: 'cascade', label: 'Cascade · 8' },
			{ value: 'stacks', label: 'Stacks · 12' },
			{ value: 'folio', label: 'Original · 3' },
		],
	},
	{
		value: 'rows',
		label: 'Illustrated rows',
		variants: [
			{ value: 'loose-rows', label: 'Loose rows' },
			{ value: 'columns', label: 'Two columns' },
			{ value: 'paper-roll', label: 'Paper roll' },
			{ value: 'list', label: 'Original list' },
		],
	},
] as const;

export type PortfolioIllustrationVariant =
	( typeof PORTFOLIO_DIRECTIONS )[ number ][ 'variants' ][ number ][ 'value' ];

export function isPortfolioIllustrationVariant(
	value: unknown
): value is PortfolioIllustrationVariant {
	return PORTFOLIO_DIRECTIONS.some( ( direction ) =>
		direction.variants.some( ( variant ) => variant.value === value )
	);
}
