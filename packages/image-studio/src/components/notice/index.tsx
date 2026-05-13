import { Notice, SnackbarList } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as imageStudioStore } from '../../store';
import type { ImageStudioActions, Notice as NoticeType } from '../../store';
import './style.scss';

/**
 * Renders a single inline notice (warning or info) using the core Notice
 * component. Dismissibility is controlled by the notice's `dismissible`
 * flag (set by the store). Opens links in a new tab to preserve modal context.
 * @param root0           - Component props.
 * @param root0.notice    - The notice object to render.
 * @param root0.onDismiss - Callback when notice is dismissed.
 */
function InlineNotice( { notice, onDismiss }: { notice: NoticeType; onDismiss?: () => void } ) {
	const isDismissible = notice.dismissible ?? false;
	const status = notice.type === 'info' ? 'info' : 'warning';

	return (
		<Notice
			status={ status }
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

	// 'warning' and 'info' render as inline banners; 'success' / 'error'
	// route through SnackbarList as transient toasts.
	const inlineNotices = ( notices ?? [] ).filter(
		( n ) => n.type === 'warning' || n.type === 'info'
	);
	const snackbarNotices = ( notices ?? [] ).filter(
		( n ) => n.type !== 'warning' && n.type !== 'info'
	);

	return (
		<>
			{ inlineNotices.map( ( notice ) => (
				<InlineNotice
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
						explicitDismiss: notice.type === 'error',
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
