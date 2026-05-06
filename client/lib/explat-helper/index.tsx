import { createRoot } from 'react-dom/client';
import ExPlatHelperPanel from './explat-panel';

import './style.scss';

export default function injectExPlatHelper( element: HTMLElement ) {
	createRoot( element ).render( <ExPlatHelperPanel /> );
}
