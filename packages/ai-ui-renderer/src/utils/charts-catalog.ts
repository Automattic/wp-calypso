import type { InteractiveUiCatalogDocument } from './definitions';

/** The ID of the charts catalog, which the shared charts implement. */
export const CHARTS_CATALOG_ID = 'urn:automattic:ai-ui-renderer:charts:v1';

// The palette's six colors have checked contrast, so a chart has at most six series or slices.
const MAX_COLORS = 6;

const TITLE = {
	type: 'string',
	description:
		'What the chart shows, in the user’s language. It also names the chart for screen readers.',
};

// A component rejects props it doesn't declare, and a chart can sit in a `Row` or `Column`.
const WEIGHT = { type: 'number' };

const LABEL = { type: 'string', minLength: 1 };

const VALUE = { type: 'number' };

// Items reject keys they don't declare too, as the chart library reads some, such as a color.
function getItemSchema( properties: Record< string, object > ) {
	return {
		type: 'object',
		properties,
		required: Object.keys( properties ),
		additionalProperties: false,
	};
}

function getSeriesSchema( point: Record< string, object > ) {
	return {
		type: 'array',
		minItems: 1,
		maxItems: MAX_COLORS,
		items: getItemSchema( {
			label: { ...LABEL, description: 'The series’ name in the legend.' },
			data: { type: 'array', minItems: 1, items: getItemSchema( point ) },
		} ),
	};
}

/**
 * The charts catalog's document. Its components are leaves: lay them out with the basic ones.
 * Hosts list it with `getInteractiveUiRendererCapabilities()`, and build it from `CHARTS_CATALOG`.
 */
export const CHARTS_CATALOG_DOCUMENT: InteractiveUiCatalogDocument = {
	catalogId: CHARTS_CATALOG_ID,
	instructions: 'Chart only numbers from tool results or the user.',
	components: {
		LineChart: {
			type: 'object',
			description: 'Values over time, such as daily visits: a line per series.',
			properties: {
				title: TITLE,
				weight: WEIGHT,
				series: getSeriesSchema( {
					date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD.' },
					value: VALUE,
				} ),
			},
			required: [ 'title', 'series' ],
		},
		BarChart: {
			type: 'object',
			description:
				'Values by category, such as sales by product: a bar per series in each category.',
			properties: {
				title: TITLE,
				weight: WEIGHT,
				series: getSeriesSchema( {
					label: { ...LABEL, description: 'The category.' },
					value: VALUE,
				} ),
				orientation: {
					type: 'string',
					enum: [ 'vertical', 'horizontal' ],
					description:
						'Horizontal suits long category names or more than five categories. Defaults to vertical.',
				},
			},
			required: [ 'title', 'series' ],
		},
		PieChart: {
			type: 'object',
			description: 'Each part’s share of a whole, such as traffic by source.',
			properties: {
				title: TITLE,
				weight: WEIGHT,
				data: {
					type: 'array',
					minItems: 1,
					maxItems: MAX_COLORS,
					description: `At most ${ MAX_COLORS } slices: group the rest as "Other".`,
					items: getItemSchema( { label: LABEL, value: { ...VALUE, minimum: 0 } } ),
				},
			},
			required: [ 'title', 'data' ],
		},
	},
};
