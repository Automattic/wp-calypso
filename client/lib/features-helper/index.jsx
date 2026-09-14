import { createRoot } from 'react-dom/client';
import FeatureList from './feature-list';

import './style.scss';

/**
 * @param element HTML Element
 */
export default function injectFeatureHelper( element ) {
	createRoot( element ).render( <FeatureList /> );
}
