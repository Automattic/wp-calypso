/**
 * External Dependencies
 */
import React, { PropTypes, PureComponent } from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import Gridicon from 'components/gridicon';

// todo: move this file!
const components = require( '../../../server/devdocs/proptypes-index.json' );

/**
 * Finds a non-example component in the library of components
 * @param {string} slug The slug to search for
 * @return {Array} An array of component matches
 */
export function findRealComponent( slug ) {
	// remove the last character. As of right now, all plural display names are with just an 's'
	const singular = slug.slice( 0, -1 );
	return components.filter( ( component ) => {
		return ( slug === component.slug || singular === component.slug ) && component.includePath.indexOf( 'example' ) < 0;
	} );
}

/**
 * Renders a table of prop-types for auto-documentation
 */
class PropsViewer extends PureComponent {
	static displayName = 'PropsViewer';

	constructor( props ) {
		super( props );
	}

	/**
	 * Set the state of this component to the first matching slug
	 * @param {string} slug The slug to search for
	 */
	setComponent = ( slug ) => {
		let component = findRealComponent( slug );
		if ( component.length > 0 ) {
			component = component[ 0 ];
		} else {
			component = null;
		}

		this.setState( {
			component
		} );
	};

	componentWillMount() {
		this.setComponent( this.props.component );
	}

	componentWillReceiveProps( nextProps ) {
		this.setComponent( nextProps.component );
	}

	/**
	 * Sort prop names by (required, name)
	 * @param {string} leftName The prop name of the left side
	 * @param {string} rightName The prop name of the right side
	 * @return {number} Which side wins
	 */
	sortProps = ( leftName, rightName ) => {
		const component = this.state.component;

		const left = component.props[ leftName ];
		const right = component.props[ rightName ];
		if ( left.required === right.required ) {
			return ( leftName.toLowerCase() < rightName.toLowerCase() ? -1 : 1 );
		}

		if ( left.required ) {
			return -1;
		}

		return 1;
	};

	/**
	 * Renders a row in the table
	 * @param {object} component The component
	 * @param {string} propName The name of the prop to render
	 * @return {ReactElement} The rendered row
	 */
	renderRow( component, propName ) {
		const prop = component.props[ propName ];
		let type = 'unknown';
		if ( prop.type ) {
			switch ( prop.type.name ) {
				default:
					type = prop.type.name;
					break;
				case 'arrayOf':
				case 'oneOf':
				case 'oneOfType':
				case 'objectOf':
				case 'instanceOf':
					type = `${ prop.type.name }( ${ prop.type.value.name || 'unknown' } )`;
					break;
			}
		}

		return (
			<tr key={ propName }>
				<td>{ prop.required ? <Gridicon icon="checkmark" /> : <Gridicon icon="cross-small" /> }</td>
				<td>{ propName }</td>
				<td>{ type }</td>
				<td>{ prop.defaultValue ? prop.defaultValue.value : 'undefined' }</td>
				<td>{ prop.description }</td>
			</tr>
		);
	}

	/**
	 * Renders a table if it can
	 * @param {object} component The component to render for
	 * @return {ReactComponent|null} The table or nothing
	 */
	renderTable( component ) {
		if ( ! component ) {
			return null; //todo: explain why this table is missing
		}

		return (
			<Card compact={ true } className="props-viewer__card" tagName="div">
				<p className="props-viewer__description" >{ component.description || 'Add jsdoc to the component see it here' }</p>
				<div className="props-viewer__usage">
					<div className="props-viewer__example" >
						<span className="props-viewer__heading">Use It</span>
						<p><code>
							import { component.displayName } from '{ component.includePath }';
						</code></p>
					</div>
					<div className="props-viewer__table">
						<span className="props-viewer__heading">Props</span>
						<table>
							<thead>
							<tr>
								<td>Required</td>
								<td>Name</td>
								<td>Type</td>
								<td>Default</td>
								<td>Description</td>
							</tr>
							</thead>
							<tbody>
							{ component.props
								? Object.keys( component.props )
									.sort( this.sortProps )
									.map( ( propName ) => this.renderRow( component, propName ) )
								: null }
							</tbody>
						</table>
					</div>
				</div>
			</Card>
		);
	}

	render() {
		const component = this.state.component;

		return (
			<div>
				{ this.props.example }
				{ this.renderTable( component ) }
			</div>
		);
	}

	static propTypes = {
		/**
		 * The slug of the component being displayed
		 */
		component: PropTypes.string.isRequired,

		/**
		 * The element to display as an example of this component
		 */
		example: PropTypes.element.isRequired
	}
}

export default PropsViewer;
