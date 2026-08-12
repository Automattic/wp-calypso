import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, closeSmall, Icon, undo } from '@wordpress/icons';

type ResolvedEditActionProps = {
	onUndo: () => Promise< boolean >;
};

export default function ResolvedEditAction( { onUndo }: ResolvedEditActionProps ) {
	const [ undoState, setUndoState ] = useState< 'ready' | 'pending' | 'reverted' >( 'ready' );
	const handleUndo = async () => {
		if ( undoState !== 'ready' ) {
			return;
		}

		setUndoState( 'pending' );
		try {
			if ( await onUndo() ) {
				setUndoState( 'reverted' );
			} else {
				setUndoState( 'ready' );
			}
		} catch {
			setUndoState( 'ready' );
		}
	};
	const isReverted = undoState === 'reverted';

	return (
		<div className="agents-manager-resolved-edit-action">
			<span
				className={ `agents-manager-resolved-edit-action__status${
					isReverted ? ' agents-manager-resolved-edit-action__status--reverted' : ''
				}` }
				role="status"
			>
				<Icon
					className="agents-manager-resolved-edit-action__icon"
					icon={ isReverted ? closeSmall : check }
					size={ 20 }
				/>
				{ isReverted
					? __( 'Reverted', __i18n_text_domain__ )
					: __( 'Updated', __i18n_text_domain__ ) }
			</span>
			<button
				type="button"
				className="agents-manager-resolved-edit-action__undo"
				onClick={ () => void handleUndo() }
				disabled={ undoState !== 'ready' }
			>
				<Icon className="agents-manager-resolved-edit-action__icon" icon={ undo } size={ 20 } />
				{ __( 'Undo', __i18n_text_domain__ ) }
			</button>
		</div>
	);
}
