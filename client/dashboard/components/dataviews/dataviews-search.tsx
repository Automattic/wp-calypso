import { SearchControl } from '@wordpress/components';
import { useDebouncedInput } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef } from 'react';
import type { View } from '@wordpress/dataviews';

interface DataViewsSearchProps {
	label?: string;
	view: View;
	onChangeView: ( view: View ) => void;
}

export function DataViewsSearch( { label, view, onChangeView }: DataViewsSearchProps ) {
	const [ search, setSearch, debouncedSearch ] = useDebouncedInput( view.search );
	useEffect( () => {
		if ( view.search !== debouncedSearch ) {
			setSearch( view.search ?? '' );
		}
	}, [ view.search, setSearch ] );
	const onChangeViewRef = useRef( onChangeView );
	const viewRef = useRef( view );
	useEffect( () => {
		onChangeViewRef.current = onChangeView;
		viewRef.current = view;
	}, [ onChangeView, view ] );
	useEffect( () => {
		if ( debouncedSearch !== viewRef.current?.search ) {
			onChangeViewRef.current( {
				...viewRef.current,
				page: 1,
				search: debouncedSearch,
			} );
		}
	}, [ debouncedSearch ] );
	const searchLabel = label || __( 'Search' );
	return (
		<SearchControl
			className="dataviews-search"
			onChange={ setSearch }
			value={ search }
			label={ searchLabel }
			placeholder={ searchLabel }
			size="compact"
		/>
	);
}
