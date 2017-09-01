/**
 * External Dependencies
 */
import { find } from 'lodash';
import React, { PropTypes, PureComponent } from 'react';

/**
 * Internal Dependencies
 */
import Table from './table';
import components from '../../../server/devdocs/proptypes-index.json';

/**
 * Finds a non-example component in the library of components
 * @param {string} slug The slug to search for
 * @return {Array} An array of component matches
 */
export function findRealComponent( slug ) {
	// remove the last character. As of right now, all plural display names are with just an 's'
	const singular = slug.slice( 0, -1 );
	return find( components, ( component ) => {
		return ( slug === component.slug || singular === component.slug ) && component.includePath.indexOf( 'example' ) < 0;
	} );
}

/**
 * Renders a table of prop-types for auto-documentation
 */
class PropsViewer extends PureComponent {
	static propTypes = {
		/**
		 * The slug of the component being displayed
		 */
		component: PropTypes.string.isRequired,

		/**
		 * The element to display as an example of this component
		 */
		example: PropTypes.element.isRequired
	};

	render() {
		const component = findRealComponent( this.props.component );

		return (
			<div>
				{ this.props.example }
				{ component ? <Table component={ component } /> : null }
			</div>
		);
	}
}

export default PropsViewer;
