import FeatureList from './feature-list';

import './style.scss';

/**
 * @param root
 */
export default function injectFeatureHelper( root ) {
	root.render( <FeatureList /> );
}
