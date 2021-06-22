export function getEventsFiredForBlock( eventsStack, event, block ) {
	if ( ! eventsStack || ! event || ! block ) {
		return false;
	}

	return eventsStack.filter(
		( [ eventName, eventData ] ) => event === eventName && eventData.block_name === block
	);
}

export function getTotalEventsFiredForBlock( eventsStack, event, block ) {
	return getEventsFiredForBlock( eventsStack, event, block ).length;
}

export async function clearEventsStack( driver ) {
	// Reset e2e tests events stack after each step in order
	// that we have a test specific stack to assert against.
	await driver.executeScript( `window._e2eEventsStack = [];` );
}

export async function getEventsStack( driver ) {
	return await driver.executeScript( `return window._e2eEventsStack;` );
}
