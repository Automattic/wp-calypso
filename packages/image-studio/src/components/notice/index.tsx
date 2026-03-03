import { Notice, SnackbarList } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as imageStudioStore } from '../../store';
import type { ImageStudioActions, Notice as NoticeType } from '../../store';
import './style.scss';

/**
 * Renders a single warning notice using the core Notice component.
 * Opens links in new tab to preserve Image Studio modal context.
 * @param root0        - Component props.
 * @param root0.notice - The notice object to render.
 */
function WarningNotice( { notice }: { notice: NoticeType } ) {
	return (
		<Notice
			status="warning"
			// Intentionally non-dismissible: upgrade prompts should persist until user takes action
			isDismissible={ false }
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
				<WarningNotice key={ notice.id } notice={ notice } />
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
