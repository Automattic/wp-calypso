export const STYLE_CONSTANTS = {
	COLLAPSED_SIZE: 56,
	COMPACT_WIDTH: 372,
	EXPANDED_HEIGHT: 520,
	AUTO_COLLAPSE_DELAY: 1500,
	BORDER_RADIUS: 24,
	PADDING: 16,
	VIEWPORT_OFFSET: 16,
} as const;

// The 8 resize handles. Edges map to a single axis; corners resize both. Cursor
// follows the edge orientation. The className maps to a CSS rule that positions
// the hit area (6px edge strips, 12px corner squares with higher z-index).
export const RESIZE_HANDLES = [
	{ edge: 'top', cursor: 'ns-resize', className: 'resizeTop' },
	{ edge: 'right', cursor: 'ew-resize', className: 'resizeRight' },
	{ edge: 'bottom', cursor: 'ns-resize', className: 'resizeBottom' },
	{ edge: 'left', cursor: 'ew-resize', className: 'resizeLeft' },
	{ edge: 'top-left', cursor: 'nwse-resize', className: 'resizeTopLeft' },
	{ edge: 'top-right', cursor: 'nesw-resize', className: 'resizeTopRight' },
	{
		edge: 'bottom-right',
		cursor: 'nwse-resize',
		className: 'resizeBottomRight',
	},
	{
		edge: 'bottom-left',
		cursor: 'nesw-resize',
		className: 'resizeBottomLeft',
	},
] as const;

// The handles to render for a given `resizable` mode. A corner is two-axis so it
// only appears in 'both'/true; restricting the set locks the other axis (the
// resize loop only acts on handles that exist).
export function getVisibleResizeHandles(
	resizable: boolean | 'horizontal' | 'vertical'
): ( typeof RESIZE_HANDLES )[ number ][] {
	if ( resizable === 'horizontal' ) {
		return RESIZE_HANDLES.filter( ( handle ) =>
			[ 'left', 'right' ].includes( handle.edge )
		);
	}

	if ( resizable === 'vertical' ) {
		return RESIZE_HANDLES.filter( ( handle ) =>
			[ 'top', 'bottom' ].includes( handle.edge )
		);
	}

	return [ ...RESIZE_HANDLES ];
}

export const DRAG_CONSTANTS = {
	SPRING_CONFIG: {
		type: 'spring' as const,
		damping: 25,
		stiffness: 300,
	},
	VELOCITY_MULTIPLIER: 0.1,
	// Values here should also be in ../styles/global.css to keep cursor consistency
	NON_DRAGGABLE_SELECTORS: [
		'[data-slot="messages"]',
		'[data-slot="chat-input"]',
		'[data-slot="chat-footer"]',
		'[data-slot="chat-header"] [data-slot="button"]',
	].join( ', ' ),
} as const;
