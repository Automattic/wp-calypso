import { SPOTLIT_ELEMENT_CLASS } from './tour-kit-spotlight';

export interface SpotlightInteractivityConfiguration {
	/** If true, the user will be allowed to interact with the spotlit element. Defaults to false. */
	enabled?: boolean;
	/**
	 * This element is the root element within which all children will have
	 * pointer-events disabled during the tour. Defaults to '#wpwrap'
	 */
	rootElementSelector?: string;
}

export const SpotlightInteractivity: React.VFC< SpotlightInteractivityConfiguration > = ( {
	enabled = false,
	rootElementSelector = '#wpwrap',
}: SpotlightInteractivityConfiguration ) => {
	if ( ! enabled ) {
		return null;
	}
	return (
		<style>
			{ `
    .${ SPOTLIT_ELEMENT_CLASS }, .${ SPOTLIT_ELEMENT_CLASS } * {
        pointer-events: auto;
    }
    .tour-kit-frame__container button {
        pointer-events: auto;
    }
    .tour-kit-spotlight, .tour-kit-overlay {
        pointer-events: none;
    }
    ${ rootElementSelector } :not(.${ SPOTLIT_ELEMENT_CLASS }, .${ SPOTLIT_ELEMENT_CLASS } *) {
        pointer-events: none;
    }
    ` }
		</style>
	);
};
