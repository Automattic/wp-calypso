import { useEffect, useRef } from 'react';
import type { Operator, View } from '@wordpress/dataviews';

function alterUrlForViewProp(
	url: URL,
	urlKey: string,
	currentViewPropValue: string | number | string[] | number[] | undefined
): void {
	if ( currentViewPropValue ) {
		url.searchParams.set( urlKey, String( currentViewPropValue ) );
	} else {
		url.searchParams.delete( urlKey );
	}
}

export function persistViewToUrl(
	view: View,
	fieldName: string,
	formatFieldValue?: ( fieldValue: string ) => string
): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	// Only persist certain view settings to the URL for now.
	const url = new URL( window.location.href );
	const fieldValue = view.filters?.find( ( filter ) => filter.field === fieldName )?.value;
	alterUrlForViewProp(
		url,
		fieldName,
		formatFieldValue ? formatFieldValue( fieldValue ) : fieldValue
	);
	window.history.pushState( undefined, '', url );
}

export function updateViewFromField( view: View, fieldName: string, fieldValue: string ): View {
	return {
		...view,
		filters: [
			...( view.filters ?? [] ),
			{
				value: fieldValue,
				operator: 'isAny' as Operator,
				field: fieldName,
			},
		],
	};
}

export function useSetInitialViewFromUrl( {
	fieldName,
	fieldValue,
	setView,
}: {
	fieldName: string;
	fieldValue: string | undefined;
	setView: ( setter: View | ( ( view: View ) => View ) ) => void;
} ): void {
	const didUpdateViewFromUrl = useRef( false );
	useEffect( () => {
		if ( ! fieldValue ) {
			return;
		}
		if ( didUpdateViewFromUrl.current ) {
			return;
		}
		didUpdateViewFromUrl.current = true;
		setView( ( view ) => updateViewFromField( view, fieldName, fieldValue ) );
	}, [ fieldName, fieldValue, setView ] );
}
