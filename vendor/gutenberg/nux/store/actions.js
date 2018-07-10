/**
 * Returns an action object that, when dispatched, presents a guide that takes
 * the user through a series of tips step by step.
 *
 * @param {string[]} tipIds Which tips to show in the guide.
 *
 * @return {Object} Action object.
 */
export function triggerGuide( tipIds ) {
	return {
		type: 'TRIGGER_GUIDE',
		tipIds,
	};
}

/**
 * Returns an action object that, when dispatched, dismisses the given tip. A
 * dismissed tip will not show again.
 *
 * @param {string} id The tip to dismiss.
 *
 * @return {Object} Action object.
 */
export function dismissTip( id ) {
	return {
		type: 'DISMISS_TIP',
		id,
	};
}

/**
 * Returns an action object that, when dispatched, prevents all tips from
 * showing again.
 *
 * @return {Object} Action object.
 */
export function disableTips() {
	return {
		type: 'DISABLE_TIPS',
	};
}

/**
 * Returns an action object that, when dispatched, makes all tips show again.
 *
 * @return {Object} Action object.
 */
export function enableTips() {
	return {
		type: 'ENABLE_TIPS',
	};
}
