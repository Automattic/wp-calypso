import { Button } from '@wordpress/components';
import { chevronUp, chevronDown, close, edit } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import './pattern-action-bar.scss';

type PatternActionBarProps = {
	onReplace?: () => void;
	onDelete: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	disableMoveUp?: boolean;
	disableMoveDown?: boolean;
	patternType: string;
	isRemoveButtonTextOnly?: boolean;
	source: 'list' | 'large_preview';
};

const PatternActionBar = ( {
	onReplace,
	onDelete,
	onMoveUp,
	onMoveDown,
	disableMoveUp,
	disableMoveDown,
	patternType,
	isRemoveButtonTextOnly,
	source,
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
							recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_MOVEUP_CLICK, {
								source,
							} );
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
							recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_MOVEDOWN_CLICK, {
								source,
							} );
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
						recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_REPLACE_CLICK, {
							pattern_type: patternType,
							source,
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
				label={ translate( 'Remove' ) }
				onClick={ () => {
					recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_DELETE_CLICK, {
						pattern_type: patternType,
						source,
					} );
					onDelete();
				} }
				icon={ ! isRemoveButtonTextOnly ? close : null }
				iconSize={ 23 }
			>
				{ isRemoveButtonTextOnly ? translate( 'Remove' ) : null }
			</Button>
		</div>
	);
};

export default PatternActionBar;
