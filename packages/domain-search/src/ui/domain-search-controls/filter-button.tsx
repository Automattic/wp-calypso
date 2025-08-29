import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { funnel } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { forwardRef, Ref } from 'react';
import './filter-button.scss';
import { FilterState } from '../../page/types';

type Props = {
	filter: FilterState;
	onClick: () => void;
	children?: React.ReactNode;
};

export const DomainSearchControlsFilterButton = forwardRef(
	( { filter, onClick, children }: Props, ref: Ref< HTMLButtonElement > ) => {
		const { __, _n } = useI18n();
		const filterCount = filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 );

		let ariaLabel = '';
		if ( filterCount > 0 ) {
			ariaLabel = sprintf(
				/* translators: %(filterCount)s: number of active filters */
				_n(
					'Filter, %(filterCount)s filter applied',
					'Filter, %(filterCount)s filters applied',
					filterCount
				),
				{ filterCount }
			);
		} else {
			ariaLabel = __( 'Filter, no filters applied' );
		}

		return (
			<div className="domain-search-controls__filters">
				<Button icon={ funnel } variant="secondary" showTooltip onClick={ onClick } ref={ ref } />
				{ !! filterCount && (
					<div
						className="domain-search-controls__filters-count"
						/* translators: %d: number of active filters */
						aria-label={ ariaLabel }
						aria-live="polite"
						role="status"
					>
						{ filterCount }
					</div>
				) }
				{ children }
			</div>
		);
	}
);

DomainSearchControlsFilterButton.displayName = 'DomainSearchControlsFilterButton';
