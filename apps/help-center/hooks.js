import { privateApis as routerPrivateApis } from '@wordpress/router';
import { unlockRouter } from './utils';

export const useCanvasMode = () => {
	const { useLocation } = unlockRouter( routerPrivateApis );
	const { params } = useLocation();
	const { canvas = 'view' } = params;

	return canvas;
};
