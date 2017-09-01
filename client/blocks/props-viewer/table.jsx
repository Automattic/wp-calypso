/**
 * External Dependencies
 */
import React, { PropTypes, PureComponent } from 'react';

/**
 * Internal Dependencies
 */
import Row from './row';
import Card from 'components/card';

class Table extends PureComponent {
	static propTypes = {
		component: PropTypes.object.isRequired
	};

	componentDescription() {
		if ( this.props.component.description ) {
			return this.props.component.description;
		}

		return 'Add jsdoc to the component see it here';
	}

	componentIncludePath() {
		return `import ${ this.props.component.displayName } from '${ this.props.component.includePath }';`;
	}

	/**
	 * Sort prop names by (required, name)
	 * @param {string} leftName The prop name of the left side
	 * @param {string} rightName The prop name of the right side
	 * @return {number} Which side wins
	 */
	sortProps = ( leftName, rightName ) => {
		const component = this.props.component;

		const left = component.props[ leftName ];
		const right = component.props[ rightName ];
		if ( left.required === right.required ) {
			return leftName.toLowerCase().localeCompare( rightName.toLowerCase() );
		}

		if ( left.required ) {
			return -1;
		}

		return 1;
	};

	rows() {
		if ( ! this.props.component.props ) {
			return null;
		}

		return Object.keys( this.props.component.props )
			.sort( this.sortProps )
			.map( ( propName ) => <Row key={ propName } component={ this.props.component } propName={ propName } /> );
	}

	render() {
		if ( ! this.props.component ) {
			return null; //todo: explain why this table is missing
		}

		return (
			<Card compact={ true } className="props-viewer__card">
				<p className="props-viewer__description">{ this.componentDescription() }</p>
				<div className="props-viewer__usage">
					<div className="props-viewer__example">
						<span className="props-viewer__heading">Use It</span>
						<p><code>
							{ this.componentIncludePath() }
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
								{ this.rows() }
							</tbody>
						</table>
					</div>
				</div>
			</Card>
		);
	}
}

export default Table;
