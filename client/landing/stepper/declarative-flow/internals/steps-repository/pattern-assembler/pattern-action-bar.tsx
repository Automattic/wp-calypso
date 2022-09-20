import { Button } from '@wordpress/components';
import { chevronUp, chevronDown, closeSmall, edit } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

type PatternActionBarProps = {
	onReplace: () => void;
	onDelete: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	disableMoveUp?: boolean;
	disableMoveDown?: boolean;
	enableMoving?: boolean;
};

const PatternActionBar = ( {
	onReplace,
	onDelete,
	onMoveUp,
	onMoveDown,
	disableMoveUp,
	disableMoveDown,
	enableMoving,
}: PatternActionBarProps ) => {
	const translate = useTranslate();
	return (
		<div
			className="pattern-action-bar"
			role="menubar"
			aria-label={ translate( 'Pattern actions' ) }
		>
			{ enableMoving && (
				<div className="pattern-action-bar__block">
					<Button
						className="pattern-action-bar__action pattern-action-bar__action--move-up"
						disabled={ disableMoveUp }
						role="menuitem"
						label={ translate( 'Move up' ) }
						onClick={ onMoveUp }
						icon={ chevronUp }
						iconSize={ 23 }
					/>
					<Button
						className="pattern-action-bar__action pattern-action-bar__action--move-down"
						disabled={ disableMoveDown }
						role="menuitem"
						label={ translate( 'Move down' ) }
						onClick={ onMoveDown }
						icon={ chevronDown }
						iconSize={ 23 }
					/>
				</div>
			) }
			<Button
				className="pattern-action-bar__block pattern-action-bar__action"
				role="menuitem"
				label="Replace"
				onClick={ onReplace }
				icon={ edit }
				iconSize={ 20 }
			/>
			<Button
				className="pattern-action-bar__block pattern-action-bar__action"
				role="menuitem"
				label="Delete"
				onClick={ onDelete }
				icon={ closeSmall }
				iconSize={ 23 }
			/>
		</div>
	);
};

export default PatternActionBar;
