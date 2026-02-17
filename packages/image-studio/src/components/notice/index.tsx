import { SnackbarList } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as imageStudioStore } from '../../store';
import type { ImageStudioActions } from '../../store';
import './style.scss';

export function ImageStudioNotice() {
	const notices = useSelect( ( select ) => {
		const selectors = select( imageStudioStore );
		return selectors.getNotices();
	}, [] );

	const { removeNotice } = useDispatch( imageStudioStore ) as ImageStudioActions;

	if ( ! notices || notices.length === 0 ) {
		return null;
	}

	return (
		<SnackbarList
			className="image-studio-notice"
			notices={ notices.map( ( notice ) => ( {
				className: `image-studio-notice-${ notice.type }`,
				id: notice.id,
				content: notice.content,
				explicitDismiss: notice.type === 'error',
			} ) ) }
			onRemove={ removeNotice }
		/>
	);
}
