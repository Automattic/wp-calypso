import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import './style.scss';

interface BulkActionsToolbarProps {
	onAutoRenew: ( enable: boolean ) => void;
}

export function BulkActionsToolbar( { onAutoRenew }: BulkActionsToolbarProps ) {
	const { __ } = useI18n();

	return (
		<div className="domains-table-bulk-actions-toolbar">
			<Button onClick={ () => onAutoRenew( true ) }>{ __( 'Enable auto-renew' ) }</Button>
			<Button onClick={ () => onAutoRenew( false ) }>{ __( 'Disable auto-renew' ) }</Button>
		</div>
	);
}
