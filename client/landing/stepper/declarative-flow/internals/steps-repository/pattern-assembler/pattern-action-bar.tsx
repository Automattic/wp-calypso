import { Icon, reusableBlock, chevronUp, chevronDown, closeSmall } from '@wordpress/icons';
import classNames from 'classnames';

type PatternActionBarProps = {
	onReplace: () => void;
	onDelete: () => void;
	onOrderUp?: () => void;
	onOrderDown?: () => void;
	disableOrderUp?: boolean;
	disableOrderDown?: boolean;
	enableOrdering?: boolean;
};

const PatternActionBar = ( {
	onReplace,
	onDelete,
	onOrderUp,
	onOrderDown,
	disableOrderUp,
	disableOrderDown,
	enableOrdering,
}: PatternActionBarProps ) => {
	return (
		<div className="pattern-action-bar" role="menubar" aria-label="Pattern Actions">
			{ enableOrdering && (
				<div className="pattern-action-bar__block">
					<div
						className={ classNames( 'pattern-action-bar__action --action-order-up', {
							'--disabled': disableOrderUp,
						} ) }
						role="menuitem"
						aria-label="Order Up"
						title="Order Up"
						tabIndex={ 0 }
						onClick={ onOrderUp }
					>
						<Icon icon={ chevronUp } size={ 23 } />
					</div>
					<div
						className={ classNames( 'pattern-action-bar__action --action-order-down', {
							'--disabled': disableOrderDown,
						} ) }
						role="menuitem"
						aria-label="Order Down"
						title="Order Down"
						tabIndex={ 0 }
						onClick={ onOrderDown }
					>
						<Icon icon={ chevronDown } size={ 23 } />
					</div>
				</div>
			) }
			<div
				className="pattern-action-bar__block pattern-action-bar__action"
				role="menuitem"
				aria-label="Replace"
				title="Replace"
				tabIndex={ 0 }
				onClick={ onReplace }
			>
				<Icon icon={ reusableBlock } size={ 23 } />
			</div>
			<div
				className="pattern-action-bar__block pattern-action-bar__action"
				role="menuitem"
				aria-label="Delete"
				title="Delete"
				tabIndex={ 0 }
				onClick={ onDelete }
			>
				<Icon icon={ closeSmall } size={ 23 } />
			</div>
		</div>
	);
};

export default PatternActionBar;
