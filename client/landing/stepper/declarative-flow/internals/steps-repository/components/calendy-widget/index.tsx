import React, { useEffect, useMemo } from 'react';

const CALENDLY_SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';

declare global {
	interface Window {
		Calendly: any;
	}
}

type CalendlyPrefillData = {
	name?: string;
	email?: string;
	// Add other prefill fields as needed
};

type CalendlyWidgetProps = {
	url: string;
	id?: string;
	prefill?: CalendlyPrefillData;
	onSchedule?: () => void;
};

function isCalendlyEvent( e: MessageEvent ): boolean {
	return (
		e.origin === 'https://calendly.com' && e.data.event && e.data.event.indexOf( 'calendly.' ) === 0
	);
}

const CalendlyWidget: React.FC< CalendlyWidgetProps > = ( { url, id, prefill, onSchedule } ) => {
	const widgetId = useMemo(
		() => id || `calendly-widget-${ Math.random().toString( 36 ).substr( 2, 9 ) }`,
		[ id ]
	);

	useEffect( () => {
		const handleMessage = ( e: MessageEvent ) => {
			if ( isCalendlyEvent( e ) && e.data.event === 'calendly.event_scheduled' ) {
				onSchedule?.();
			}
		};

		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ onSchedule ] );

	useEffect( () => {
		// Check if the script is already loaded
		if ( ! document.querySelector( `script[src="${ CALENDLY_SCRIPT_URL }"]` ) ) {
			const script = document.createElement( 'script' );
			script.src = CALENDLY_SCRIPT_URL;
			script.async = true;
			document.body.appendChild( script );
		}

		const loadCalendly = async () => {
			while ( typeof window.Calendly === 'undefined' || ! url ) {
				await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
			}

			const element = document.getElementById( widgetId );
			if ( element ) {
				// Clear out the container div when props change.
				element.innerHTML = '';
				window.Calendly.initInlineWidget( {
					url: `https://calendly.com/${ url }`,
					parentElement: document.getElementById( widgetId ),
					prefill: prefill || {},
					utm: {},
				} );
			}
		};

		loadCalendly();

		// Cleanup function
		return () => {
			const existingScript = document.querySelector( `script[src="${ CALENDLY_SCRIPT_URL }"]` );
			if ( existingScript ) {
				existingScript.remove();
			}
		};
	}, [ url, widgetId, prefill ] );

	return <div id={ widgetId } className="calendly-widget" />;
};

export default CalendlyWidget;
