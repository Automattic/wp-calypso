/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, memo } from '@wordpress/element';
import { SearchControl } from '@wordpress/components';
import { useDebouncedInput } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { useDataViewsContext } from '../..';
interface SearchProps {
	label?: string;
}

/**
 * DataViewsSearch is a component that renders a search input
 * for the DataViews component.
 * It connects to the DataViewsContext to handle the search input.
 */
const DataViewsSearch = memo( function Search( { label }: SearchProps ) {
	const { view, onChangeView } = useDataViewsContext();
	const [ search, setSearch, debouncedSearch ] = useDebouncedInput(
		view.search
	);

	useEffect( () => {
		setSearch( view.search ?? '' );
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
			__nextHasNoMarginBottom
			onChange={ setSearch }
			value={ search }
			label={ searchLabel }
			placeholder={ searchLabel }
			size="compact"
		/>
	);
} );

export default DataViewsSearch;
