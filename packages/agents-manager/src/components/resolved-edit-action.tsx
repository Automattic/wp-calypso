import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, closeSmall, Icon, redo, undo } from '@wordpress/icons';

type ResolvedEditActionProps = {
	disabled?: boolean;
	initiallyReverted?: boolean;
	onRedo?: () => Promise< boolean >;
	onUndo?: () => Promise< boolean >;
};

export default function ResolvedEditAction( {
	disabled = false,
	initiallyReverted = false,
	onRedo,
	onUndo,
}: ResolvedEditActionProps ) {
	const [ isReverted, setIsReverted ] = useState( initiallyReverted );
	const [ isPending, setIsPending ] = useState( false );
	useEffect( () => setIsReverted( initiallyReverted ), [ initiallyReverted ] );
	const action = isReverted ? onRedo : onUndo;
	const handleAction = async () => {
		if ( ! action || disabled || isPending ) {
			return;
		}

		setIsPending( true );
		try {
			if ( await action() ) {
				setIsReverted( ! isReverted );
			}
		} catch {
			return;
		} finally {
			setIsPending( false );
		}
	};

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
			{ action && (
				<button
					type="button"
					className="agents-manager-resolved-edit-action__undo"
					onClick={ () => void handleAction() }
					disabled={ disabled || isPending }
				>
					<Icon
						className="agents-manager-resolved-edit-action__icon"
						icon={ isReverted ? redo : undo }
						size={ 20 }
					/>
					{ isReverted ? __( 'Redo', __i18n_text_domain__ ) : __( 'Undo', __i18n_text_domain__ ) }
				</button>
			) }
		</div>
	);
}
