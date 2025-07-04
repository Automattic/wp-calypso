import { Button, Popover, __experimentalHStack as HStack } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { funnel } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { DomainSearchControlsFiltersList } from './filters-list';
import './filters.scss';

type Props = {
	count?: number;
	availableTlds?: string[];
};

export const DomainSearchControlsFilters = ( { count, availableTlds }: Props ) => {
	const { __ } = useI18n();
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<div className="domain-search-controls__filters">
			<Button
				icon={ funnel }
				variant="secondary"
				showTooltip
				onClick={ () => setIsOpen( ! isOpen ) }
			/>
			{ !! count && (
				<div
					className="domain-search-controls__filters-count"
					/* translators: %d: number of active filters */
					aria-label={ sprintf( __( 'Number of active filters: %d' ), count ) }
					aria-live="polite"
					role="status"
				>
					{ count }
				</div>
			) }
			{ isOpen && (
				<Popover
					className="domain-search-controls__filters-popover"
					focusOnMount
					placement="bottom-end"
					onFocusOutside={ () => setIsOpen( false ) }
				>
					<DomainSearchControlsFiltersList availableTlds={ availableTlds } />
					<HStack justify="space-between" alignment="center">
						<Button variant="tertiary">Clear</Button>
						<Button variant="primary">Apply</Button>
					</HStack>
				</Popover>
			) }
		</div>
	);
};
