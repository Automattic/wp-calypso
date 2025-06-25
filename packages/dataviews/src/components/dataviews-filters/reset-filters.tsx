/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import type { NormalizedFilter, View } from '../../types';

interface ResetFilterProps {
	filters: NormalizedFilter[];
	view: View;
	onChangeView: ( view: View ) => void;
}

export default function ResetFilter( {
	filters,
	view,
	onChangeView,
}: ResetFilterProps ) {
	const isPrimary = ( field: string ) =>
		filters.some(
			( _filter ) => _filter.field === field && _filter.isPrimary
		);
	const isDisabled =
		! view.search &&
		! view.filters?.some(
			( _filter ) =>
				_filter.value !== undefined || ! isPrimary( _filter.field )
		);
	return (
		<Button
			disabled={ isDisabled }
			accessibleWhenDisabled
			size="compact"
			variant="tertiary"
			className="dataviews-filters__reset-button"
			onClick={ () => {
				onChangeView( {
					...view,
					page: 1,
					search: '',
					filters: [],
				} );
			} }
		>
			{ __( 'Reset' ) }
		</Button>
	);
}
