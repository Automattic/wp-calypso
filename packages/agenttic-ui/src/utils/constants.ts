export const STYLE_CONSTANTS = {
	COLLAPSED_SIZE: 56,
	COMPACT_WIDTH: 372,
	EXPANDED_HEIGHT: 520,
	AUTO_COLLAPSE_DELAY: 1500,
	BORDER_RADIUS: 24,
	PADDING: 16,
	VIEWPORT_OFFSET: 16,
} as const;

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
