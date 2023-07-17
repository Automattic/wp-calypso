/**
 * See PekYwv-WG-p2
 */
export const PATTERN_ASSEMBLER_EVENTS = {
	/**
	 * Screen Main
	 */
	MAIN_ITEM_SELECT: 'calypso_signup_pattern_assembler_main_item_select',
	CONTINUE_CLICK: 'calypso_signup_pattern_assembler_continue_click',
	CONTINUE_MISCLICK: 'calypso_signup_pattern_assembler_continue_misclick',
	BACK_CLICK: 'calypso_signup_pattern_assembler_back_click',
	PATTERN_FINAL_SELECT: 'calypso_signup_pattern_assembler_pattern_final_select',

	/**
	 * Screen Colors
	 */
	SCREEN_COLORS_PREVIEW_CLICK: 'calypso_signup_pattern_assembler_screen_colors_preview_click',
	SCREEN_COLORS_BACK_CLICK: 'calypso_signup_pattern_assembler_screen_colors_back_click',
	SCREEN_COLORS_DONE_CLICK: 'calypso_signup_pattern_assembler_screen_colors_done_click',

	/**
	 * Screen Fonts
	 */
	SCREEN_FONTS_PREVIEW_CLICK: 'calypso_signup_pattern_assembler_screen_fonts_preview_click',
	SCREEN_FONTS_BACK_CLICK: 'calypso_signup_pattern_assembler_screen_fonts_back_click',
	SCREEN_FONTS_DONE_CLICK: 'calypso_signup_pattern_assembler_screen_fonts_done_click',

	/**
	 * Screen Category List
	 */
	SCREEN_CATEGORY_LIST_CATEGORY_CLICK: 'calypso_signup_pattern_assembler_category_click',

	/**
	 * Screen Activation
	 */
	SCREEN_ACTIVATION_ACTIVATE_CLICK:
		'calypso_signup_pattern_assembler_screen_activation_activate_click',

	/**
	 * Pattern Panels
	 */
	PATTERN_SELECT_CLICK: 'calypso_signup_pattern_assembler_pattern_select_click',
	PATTERN_SELECT_BACK_CLICK: 'calypso_signup_pattern_assembler_pattern_select_back_click',
	PATTERN_SELECT_DONE_CLICK: 'calypso_signup_pattern_assembler_pattern_select_done_click',

	/**
	 * Pattern Actions
	 */
	PATTERN_MOVEUP_CLICK: 'calypso_signup_pattern_assembler_pattern_moveup_click',
	PATTERN_MOVEDOWN_CLICK: 'calypso_signup_pattern_assembler_pattern_movedown_click',
	PATTERN_REPLACE_CLICK: 'calypso_signup_pattern_assembler_pattern_replace_click',
	PATTERN_DELETE_CLICK: 'calypso_signup_pattern_assembler_pattern_delete_click',
	PREVIEW_DEVICE_CLICK: 'calypso_signup_pattern_assembler_preview_device_click',

	/**
	 * Global Styles Gating Modal
	 */
	GLOBAL_STYLES_GATING_MODAL_SHOW:
		'calypso_signup_pattern_assembler_global_styles_gating_modal_show',
	GLOBAL_STYLES_GATING_MODAL_CLOSE_BUTTON_CLICK:
		'calypso_signup_pattern_assembler_global_styles_gating_modal_close_button_click',
	GLOBAL_STYLES_GATING_MODAL_CHECKOUT_BUTTON_CLICK:
		'calypso_signup_pattern_assembler_global_styles_gating_modal_checkout_button_click',
	GLOBAL_STYLES_GATING_MODAL_UPGRADE_LATER_BUTTON_CLICK:
		'calypso_signup_pattern_assembler_global_styles_gating_modal_upgrade_later_button_click',

	/**
	 * Large Preview
	 */
	LARGE_PREVIEW_ADD_HEADER_BUTTON_CLICK:
		'calypso_signup_pattern_assembler_large_preview_add_header_button_click',
} as const;
