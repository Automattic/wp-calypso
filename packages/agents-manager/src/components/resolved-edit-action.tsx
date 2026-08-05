import { __ } from '@wordpress/i18n';
import { check, Icon, undo } from '@wordpress/icons';

type ResolvedEditActionProps = {
	onUndo: () => void | Promise< void >;
};

export default function ResolvedEditAction( { onUndo }: ResolvedEditActionProps ) {
	return (
		<div className="agents-manager-resolved-edit-action">
			<span className="agents-manager-resolved-edit-action__status" role="status">
				<Icon className="agents-manager-resolved-edit-action__icon" icon={ check } size={ 20 } />
				{ __( 'Updated', __i18n_text_domain__ ) }
			</span>
			<button
				type="button"
				className="agents-manager-resolved-edit-action__undo"
				onClick={ () => void onUndo() }
			>
				<Icon className="agents-manager-resolved-edit-action__icon" icon={ undo } size={ 20 } />
				{ __( 'Undo', __i18n_text_domain__ ) }
			</button>
		</div>
	);
}
