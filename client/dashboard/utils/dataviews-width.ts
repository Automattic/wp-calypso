import type { View } from '@wordpress/dataviews';

/**
 * Change which DataView fields are visible based on the current page width.
 */
export function adjustDataViewFieldsForWidth( {
	width,
	setView,
	wideFields,
	desktopFields,
	mobileFields,
}: {
	width: number;
	setView: ( setter: View | ( ( view: View ) => View ) ) => void;
	wideFields: string[];
	desktopFields: string[];
	mobileFields: string[];
} ): void {
	if ( width >= 1280 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== wideFields.length ) {
				return {
					...view,
					fields: wideFields,
				};
			}
			return view;
		} );
		return;
	}
	if ( width >= 960 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== desktopFields.length ) {
				return {
					...view,
					fields: desktopFields,
				};
			}
			return view;
		} );
		return;
	}
	if ( width < 960 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== mobileFields.length ) {
				return {
					...view,
					fields: mobileFields,
				};
			}
			return view;
		} );
		return;
	}
}
