import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { funnel } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { forwardRef, Ref } from 'react';
import './filter-button.scss';

type Props = {
	count: number;
	onClick: () => void;
	children?: React.ReactNode;
	disabled?: boolean;
};

export const DomainSearchControlsFilterButton = forwardRef(
	( { count, onClick, disabled, children }: Props, ref: Ref< HTMLButtonElement > ) => {
		const { __, _n } = useI18n();

		let ariaLabel = '';
		if ( count > 0 ) {
			ariaLabel = sprintf(
				/* translators: %(filterCount)s: number of active filters */
				_n(
					'Filter, %(filterCount)s filter applied',
					'Filter, %(filterCount)s filters applied',
					count
				),
				{ filterCount: count }
			);
		} else {
			ariaLabel = __( 'Filter, no filters applied' );
		}

		return (
			<div className="domain-search-controls__filters">
				<Button
					icon={ funnel }
					label={ ariaLabel }
					variant="secondary"
					showTooltip
					onClick={ onClick }
					ref={ ref }
					disabled={ disabled }
				/>
				{ !! count && (
					<div className="domain-search-controls__filters-count" aria-hidden="true">
						{ count }
					</div>
				) }
				{ children }
			</div>
		);
	}
);

DomainSearchControlsFilterButton.displayName = 'DomainSearchControlsFilterButton';
