/**
 * This set of reporters try to detect if the tab/window was 'hidden' at any point during the report duration.
 * It doesn't care about the current state or when it becomes 'visible', that's why we don't listen for that
 * state change.
 *
 * It is not perfect because it can't detect if the tab/window was hidden between the page load and when the
 * start collector is called.
 *
 * It also assumes there is only one report running. If we ever have more than one, we may have problems when
 * unsubscribing from the `visibilitychange` event.
 */
import type { Collector } from '../types';

// Assume it is visible by default. If the Page Visiblity API is not supported by the browser, it will be reported as visible.
let wasHidden = false;

const handleVisibilityChange = () => {
	if ( document.visibilityState === 'hidden' ) {
		wasHidden = true;
	}
};

export const collectorStart: Collector = ( report ) => {
	if ( document.visibilityState === 'hidden' ) {
		wasHidden = true;
	} else {
		document.addEventListener( 'visibilitychange', handleVisibilityChange );
	}
	return report;
};

export const collectorStop: Collector = ( report ) => {
	document.removeEventListener( 'visibilitychange', handleVisibilityChange );
	report.data.set( 'hidden', wasHidden );
	return report;
};
