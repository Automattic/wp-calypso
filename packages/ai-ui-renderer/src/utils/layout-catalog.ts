import type { InteractiveUiCatalogDocument } from './definitions';

export const LAYOUT_CATALOG_ID = 'urn:automattic:ai-ui-renderer:layouts:v1';

const CHILDREN = { $ref: 'common_types.json#/$defs/ChildList' };
const GAP = { type: 'string', enum: [ 'none', 'xs', 'sm', 'md', 'lg', 'xl' ] };
const ALIGN = { type: 'string', enum: [ 'start', 'center', 'end', 'stretch' ] };

export const LAYOUT_CATALOG_DOCUMENT: InteractiveUiCatalogDocument = {
	catalogId: LAYOUT_CATALOG_ID,
	instructions:
		'Use Grid for responsive cards or a two-column detail view, and Stack for spaced rows or columns. Children are component IDs, in reading order. Layouts work with any theme. Do not use layout to imply unavailable actions.',
	components: {
		Grid: {
			type: 'object',
			description: 'A responsive grid. Columns collapse when its container becomes too narrow.',
			properties: {
				children: CHILDREN,
				gap: GAP,
				minColumnWidth: {
					type: 'integer',
					minimum: 120,
					maximum: 1200,
					description:
						'Minimum column width in pixels, default 248. A narrow container uses one column.',
				},
				columns: {
					type: 'integer',
					minimum: 1,
					maximum: 6,
					description: 'Optional maximum number of columns. Otherwise fits as many as possible.',
				},
				balance: {
					type: 'string',
					enum: [ 'equal', 'wideStart', 'wideEnd' ],
					description: 'For a two-column detail view: equal, 3:2 or 2:3. Defaults to equal.',
				},
				align: ALIGN,
			},
			required: [ 'children' ],
		},
		Stack: {
			type: 'object',
			description:
				'A spaced column, or a row that can wrap. Defaults to a column with a medium gap.',
			properties: {
				children: CHILDREN,
				direction: { type: 'string', enum: [ 'row', 'column' ] },
				gap: GAP,
				align: ALIGN,
				justify: { type: 'string', enum: [ 'start', 'center', 'end', 'space-between' ] },
				wrap: { type: 'boolean' },
			},
			required: [ 'children' ],
		},
	},
};
