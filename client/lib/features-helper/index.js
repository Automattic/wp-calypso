import ReactDom from 'react-dom';
import FeatureList from './feature-list';

import './style.scss';

/**
 * @param element HTML Element
 */
export default function injectFeatureHelper( element ) {
	ReactDom.render( <FeatureList />, element );
}
