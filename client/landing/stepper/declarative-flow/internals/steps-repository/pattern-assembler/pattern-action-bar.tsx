import { Button } from '@wordpress/components';
import { chevronUp, chevronDown, close, edit } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import './pattern-action-bar.scss';

type PatternActionBarProps = {
	onReplace?: () => void;
	onDelete: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	disableMoveUp?: boolean;
	disableMoveDown?: boolean;
	patternType: string;
};

const PatternActionBar = ( {
	onReplace,
	onDelete,
	onMoveUp,
	onMoveDown,
	disableMoveUp,
	disableMoveDown,
	patternType,
}: PatternActionBarProps ) => {
	const translate = useTranslate();
	return (
		<div
			className="pattern-action-bar"
			role="menubar"
			aria-label={ translate( 'Pattern actions' ) }
		>
			{ onMoveUp && onMoveDown && (
				<div className="pattern-action-bar__block">
					<Button
						className="pattern-action-bar__action pattern-action-bar__action--move-up"
						disabled={ disableMoveUp }
						role="menuitem"
						label={ translate( 'Move up' ) }
						onClick={ () => {
							recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_moveup_click' );
							onMoveUp?.();
						} }
						icon={ chevronUp }
						iconSize={ 23 }
					/>
					<Button
						className="pattern-action-bar__action pattern-action-bar__action--move-down"
						disabled={ disableMoveDown }
						role="menuitem"
						label={ translate( 'Move down' ) }
						onClick={ () => {
							recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_movedown_click' );
							onMoveDown?.();
						} }
						icon={ chevronDown }
						iconSize={ 23 }
					/>
				</div>
			) }
			{ onReplace && (
				<Button
					className="pattern-action-bar__block pattern-action-bar__action"
					role="menuitem"
					label={ translate( 'Replace' ) }
					onClick={ () => {
						recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_replace_click', {
							pattern_type: patternType,
						} );
						onReplace();
					} }
					icon={ edit }
					iconSize={ 20 }
				/>
			) }
			<Button
				className="pattern-action-bar__block pattern-action-bar__action"
				role="menuitem"
				label={ translate( 'Delete' ) }
				onClick={ () => {
					recordTracksEvent( 'calypso_signup_pattern_assembler_pattern_delete_click', {
						pattern_type: patternType,
					} );
					onDelete();
				} }
				icon={ close }
				iconSize={ 23 }
			/>
		</div>
	);
};

export default PatternActionBar;
