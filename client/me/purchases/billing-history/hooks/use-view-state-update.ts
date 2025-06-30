import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { View } from '@wordpress/dataviews';
import { useState, useMemo, useEffect } from 'react';
import { defaultDataViewsState, desktopFields, mobileFields, wideFields } from '../constants';

function useHidePurchasesFieldsAtCertainWidths( {
	setView,
}: {
	setView: ( setter: View | ( ( view: View ) => View ) ) => void;
} ): void {
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const currentWidth = ( () => {
		if ( isWide ) {
			return 'wide';
		}
		if ( isDesktop ) {
			return 'desktop';
		}
		return 'mobile';
	} )();
	useEffect( () => {
		switch ( currentWidth ) {
			case 'wide': {
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
			case 'desktop': {
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
			case 'mobile': {
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
	}, [ currentWidth, setView ] );
}

export function useViewStateUpdate() {
	const [ view, setView ] = useState< View >( defaultDataViewsState );

	useHidePurchasesFieldsAtCertainWidths( { setView } );

	return useMemo( () => {
		return {
			view,
			updateView: setView,
		};
	}, [ view ] );
}
