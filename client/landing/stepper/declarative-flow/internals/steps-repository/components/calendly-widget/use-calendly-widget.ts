import { useCallback, useEffect } from 'react';

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

type CalendlyProps = {
	url: string;
	id?: string;
	prefill?: CalendlyPrefillData;
	hideLandingPageDetails?: boolean;
	hideEventTypeDetails?: boolean;
	hideGdprBanner?: boolean;
	onSchedule?: () => void;
	onCalendlyViewed?: () => void;
};

function isCalendlyEvent( e: MessageEvent ): boolean {
	return (
		e.origin === 'https://calendly.com' && e.data.event && e.data.event.indexOf( 'calendly.' ) === 0
	);
}

export function useCalendlyWidget( props: CalendlyProps ) {
	const {
		url,
		prefill,
		hideLandingPageDetails,
		hideEventTypeDetails,
		hideGdprBanner,
		onSchedule,
		onCalendlyViewed,
	} = props;

	/**
	 * Load the Calendly <script>
	 */
	const loadCalendlyScript = useCallback( () => {
		// Check if the script is already loaded
		if ( ! document.querySelector( `script[src="${ CALENDLY_SCRIPT_URL }"]` ) ) {
			const script = document.createElement( 'script' );
			script.src = CALENDLY_SCRIPT_URL;
			script.async = true;
			document.body.appendChild( script );
		}
	}, [ CALENDLY_SCRIPT_URL ] );

	/**
	 * Remove the Calendly <script>
	 */
	const removeCalendlyScript = useCallback( () => {
		const existingScript = document.querySelector( `script[src="${ CALENDLY_SCRIPT_URL }"]` );
		existingScript?.remove();
	}, [ CALENDLY_SCRIPT_URL ] );

	/**
	 * Load the Calendly <script> on mount and remove it on unmount
	 */
	useEffect( () => {
		loadCalendlyScript();
		return removeCalendlyScript;
	}, [ url ] );

	/**
	 * Listen for Calendly events
	 */
	useEffect( () => {
		const handleMessage = ( e: MessageEvent ) => {
			if ( isCalendlyEvent( e ) && e.data.event === 'calendly.event_scheduled' ) {
				onSchedule?.();
			} else if ( isCalendlyEvent( e ) && e.data.event === 'calendly.event_type_viewed' ) {
				onCalendlyViewed?.();
			}
		};

		window.addEventListener( 'message', handleMessage );
		return () => window.removeEventListener( 'message', handleMessage );
	}, [ onSchedule, onCalendlyViewed ] );

	/**
	 * Open the Calendly popup widget
	 */
	const openCalendlyPopup = useCallback( () => {
		const queryParams = new URLSearchParams();

		queryParams.set( 'primary_color', '000000' );
		queryParams.set( 'hide_gdpr_banner', hideGdprBanner ? '1' : '0' );
		queryParams.set( 'hide_event_type_details', hideEventTypeDetails ? '1' : '0' );
		queryParams.set( 'hide_landing_page_details', hideLandingPageDetails ? '1' : '0' );

		window?.Calendly?.initPopupWidget( {
			url: `https://calendly.com/${ url }?${ queryParams.toString() }`,
			prefill: prefill || {},
			utm: {},
		} );
	}, [ url, prefill, hideLandingPageDetails, hideEventTypeDetails, hideGdprBanner ] );

	/**
	 * Close the Calendly popup widget
	 */
	const closeCalendlyPopup = useCallback( () => {
		window?.Calendly?.closePopupWidget();
	}, [ url ] );

	return {
		openCalendlyPopup,
		closeCalendlyPopup,
	};
}
