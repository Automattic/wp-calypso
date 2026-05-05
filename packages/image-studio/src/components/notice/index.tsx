import { Notice, SnackbarList } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as imageStudioStore } from '../../store';
import type { ImageStudioActions, Notice as NoticeType } from '../../store';
import './style.scss';

/**
 * Renders a single warning notice using the core Notice component.
 * Dismissibility is controlled by the notice's `dismissible` flag (set by the store).
 * Opens links in new tab to preserve Image Studio modal context.
 * @param root0           - Component props.
 * @param root0.notice    - The notice object to render.
 * @param root0.onDismiss - Callback when notice is dismissed.
 */
function WarningNotice( { notice, onDismiss }: { notice: NoticeType; onDismiss?: () => void } ) {
	const isDismissible = notice.dismissible ?? false;

	return (
		<Notice
			status="warning"
			isDismissible={ isDismissible }
			onDismiss={ isDismissible ? onDismiss : undefined }
			actions={
				notice.actions?.map( ( action ) => ( {
					label: action.label,
					onClick: () => {
						const newWindow = window.open( action.url, '_blank' );
						if ( newWindow ) {
							newWindow.opener = null;
						}
					},
				} ) ) ?? []
			}
		>
			{ notice.content }
		</Notice>
	);
}

export function ImageStudioNotice() {
	const notices = useSelect( ( select ) => {
		const selectors = select( imageStudioStore );
		return selectors.getNotices();
	}, [] );

	const { removeNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	const warningNotices = ( notices ?? [] ).filter( ( n ) => n.type === 'warning' );
	const snackbarNotices = ( notices ?? [] ).filter( ( n ) => n.type !== 'warning' );

	return (
		<>
			{ warningNotices.map( ( notice ) => (
				<WarningNotice
					key={ notice.id }
					notice={ notice }
					onDismiss={ () => removeNotice( notice.id ) }
				/>
			) ) }
			{ snackbarNotices.length > 0 && (
				<SnackbarList
					className="image-studio-notice"
					notices={ snackbarNotices.map( ( notice ) => ( {
						className: `image-studio-notice-${ notice.type }`,
						id: notice.id,
						content: notice.content,
						// Errors and any notice carrying an action persist until dismissed —
						// 10s isn't enough time to read + decide whether to click the action.
						explicitDismiss: notice.type === 'error' || ( notice.actions?.length ?? 0 ) > 0,
						...( notice.actions?.length && {
							actions: notice.actions.map( ( action ) => ( {
								label: action.label,
								onClick: () => {
									const newWindow = window.open( action.url, '_blank' );
									if ( newWindow ) {
										newWindow.opener = null;
									}
								},
							} ) ),
						} ),
					} ) ) }
					onRemove={ removeNotice }
				/>
			) }
		</>
	);
}
