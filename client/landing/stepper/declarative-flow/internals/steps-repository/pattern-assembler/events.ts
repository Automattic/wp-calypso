/**
 * See PekYwv-WG-p2
 */
export const PATTERN_ASSEMBLER_EVENTS = {
	/**
	 * Common for screens
	 */
	SCREEN_BACK_CLICK: 'calypso_signup_pattern_assembler_screen_back_click',
	SCREEN_CONTINUE_CLICK: 'calypso_signup_pattern_assembler_screen_continue_click',

	/**
	 * Screen Main
	 */
	MAIN_ITEM_SELECT: 'calypso_signup_pattern_assembler_main_item_select',
	BACK_CLICK: 'calypso_signup_pattern_assembler_back_click',
	PATTERN_FINAL_SELECT: 'calypso_signup_pattern_assembler_pattern_final_select',
	CATEGORY_LIST_CATEGORY_CLICK: 'calypso_signup_pattern_assembler_category_click',

	/**
	 * Screen Styles
	 */
	SCREEN_COLORS_PREVIEW_CLICK: 'calypso_signup_pattern_assembler_screen_colors_preview_click',
	SCREEN_FONTS_PREVIEW_CLICK: 'calypso_signup_pattern_assembler_screen_fonts_preview_click',
	CONTINUE_TO_EDITOR_CLICK: 'calypso_signup_pattern_assembler_continue_click',
	CONTINUE_MISCLICK: 'calypso_signup_pattern_assembler_continue_misclick',

	/**
	 * Screen Activation
	 */
	SCREEN_ACTIVATION_ACTIVATE_CLICK:
		'calypso_signup_pattern_assembler_screen_activation_activate_click',

	/**
	 * Screen Confirmation
	 */
	SCREEN_CONFIRMATION_CONFIRM_CLICK:
		'calypso_signup_pattern_assembler_screen_confirmation_confirm_click',

	/*
	 * Screen Upsell
	 */
	SCREEN_UPSELL_CHECKOUT_BUTTON_CLICK:
		'calypso_signup_pattern_assembler_screen_upsell_checkout_button_click',
	SCREEN_UPSELL_UPGRADE_LATER_BUTTON_CLICK:
		'calypso_signup_pattern_assembler_screen_upsell_upgrade_later_button_click',

	/**
	 * Pattern Panels
	 */
	PATTERN_SELECT_CLICK: 'calypso_signup_pattern_assembler_pattern_select_click',
	PATTERN_SHOW_MORE_CLICK: 'calypso_signup_pattern_assembler_pattern_show_more_click',

	/**
	 * Pattern Actions
	 */
	PATTERN_MOVEUP_CLICK: 'calypso_signup_pattern_assembler_pattern_moveup_click',
	PATTERN_MOVEDOWN_CLICK: 'calypso_signup_pattern_assembler_pattern_movedown_click',
	PATTERN_REPLACE_CLICK: 'calypso_signup_pattern_assembler_pattern_replace_click',
	PATTERN_DELETE_CLICK: 'calypso_signup_pattern_assembler_pattern_delete_click',
	PATTERN_SHUFFLE_CLICK: 'calypso_signup_pattern_assembler_pattern_shuffle_click',

	PREVIEW_DEVICE_CLICK: 'calypso_signup_pattern_assembler_preview_device_click',

	/**
	 * Large Preview
	 */
	LARGE_PREVIEW_ZOOM_OUT_SCALE_CHANGE:
		'calypso_signup_pattern_assembler_large_preview_zoom_out_scale_change',
} as const;
