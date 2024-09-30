import React, { useEffect, useMemo } from 'react';

declare global {
	interface Window {
		Calendly: any;
	}
}

interface PrefillData {
	name?: string;
	email?: string;
	// Add other prefill fields as needed
}

interface CalendlyWidgetProps {
	url: string;
	id?: string;
	prefill?: PrefillData;
}

const CALENDLY_SCRIPT_URL = 'https://assets.calendly.com/assets/external/widget.js';

const CalendlyWidget: React.FC< CalendlyWidgetProps > = ( { url, id, prefill } ) => {
	const widgetId = useMemo(
		() => id || `calendly-widget-${ Math.random().toString( 36 ).substr( 2, 9 ) }`,
		[ id ]
	);

	useEffect( () => {
		// Check if the script is already loaded
		if ( ! document.querySelector( `script[src="${ CALENDLY_SCRIPT_URL }"]` ) ) {
			const script = document.createElement( 'script' );
			script.src = CALENDLY_SCRIPT_URL;
			script.async = true;
			document.body.appendChild( script );
		}

		const loadCalendly = async () => {
			while ( typeof window.Calendly === 'undefined' ) {
				await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
			}

			if ( typeof document.getElementById( widgetId ) !== 'undefined' ) {
				document.getElementById( widgetId ).innerHTML = '';
			}

			window.Calendly.initInlineWidget( {
				url: `https://calendly.com/${ url }`,
				parentElement: document.getElementById( widgetId ),
				prefill: prefill || {},
				utm: {},
			} );
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

	return <div id={ widgetId } style={ { minWidth: '320px', height: '630px' } } />;
};

export default CalendlyWidget;
