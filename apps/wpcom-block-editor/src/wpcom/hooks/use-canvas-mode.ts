import { useSelect } from '@wordpress/data';
import { getUnlock } from '../utils';
import useLocation from './use-location';

const unlock = getUnlock();

const useCanvasMode = () => {
	const location = useLocation();

	return useSelect(
		( select ) => {
			const getCanvasMode = ( unlock &&
				select( 'core/edit-site' ) &&
				unlock( select( 'core/edit-site' ) ).getCanvasMode ) as ( () => string ) | undefined;

			// The selector is deprecated after GB 19.6. See https://github.com/WordPress/gutenberg/pull/66213.
			if ( getCanvasMode ) {
				return getCanvasMode();
			}

			return new URLSearchParams( location?.search ).get( 'canvas' ) || 'view';
		},
		[ location?.search ]
	);
};

export default useCanvasMode;
