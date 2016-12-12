/**
 * External dependencies
 */
import { Component, PropTypes, Children } from 'react';

export default class GraphProvider extends Component {
	static propTypes = {
		graph: PropTypes.object.isRequired,
		children: PropTypes.element.isRequired
	};

	static childContextTypes = {
		graph: PropTypes.object.isRequired
	};

	getChildContext() {
		return { graph: this.graph };
	}

	constructor( props, context ) {
		super( props, context );
		this.graph = props.graph;
	}

	render() {
		return Children.only( this.props.children );
	}
}
