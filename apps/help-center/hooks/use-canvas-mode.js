import { useSelect } from '@wordpress/data';
import { useLocation } from './use-location';

const useCanvasMode = () => {
	const location = useLocation();

	return useSelect(
		( select ) => {
			// The canvas mode is limited to the site editor.
			if ( ! select( 'core/edit-site' ) ) {
				return null;
			}

			return new URLSearchParams( location?.search ).get( 'canvas' ) || 'view';
		},
		[ location?.search ]
	);
};

export { useCanvasMode };
