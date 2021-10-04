import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

export default function ItemRemoveDialog( props ) {
	const { title, visibility, onClose, type } = props;
	const translate = useTranslate();

	return (
		<Dialog
			isVisible={ visibility }
			buttons={ [
				{ action: 'cancel', label: translate( 'Cancel' ) },
				{ action: 'delete', label: translate( 'Remove' ), isPrimary: true },
			] }
			onClose={ ( action ) => {
				onClose( action === 'delete' );
			} }
		>
			<h1>{ translate( 'Are you sure you want to remove this item?' ) }</h1>
			{ title && (
				<p className="list-manage__dialog-item-title">
					<Gridicon
						className="list-manage__dialog-item-title-icon"
						icon={ type === 'tag' ? 'tag' : 'globe' }
						size="16"
					/>
					<strong>{ title }</strong>
				</p>
			) }
			<p>{ translate( 'This action cannot be undone.' ) }</p>
		</Dialog>
	);
}
