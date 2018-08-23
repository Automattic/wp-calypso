/** @format */

/**
 * External dependencies
 */
import { findDOMNode } from 'react-dom';

const calypsoComponent = WrappedComponent => {
	return class extends WrappedComponent {
		componentDidMount() {
			if ( super.componentDidMount ) {
				super.componentDidMount();
			}
			if ( STYLE_NAMESPACE ) {
				const node = findDOMNode( this );
				node.classList.add( STYLE_NAMESPACE );
			}
		}
	};
};

export default calypsoComponent;
