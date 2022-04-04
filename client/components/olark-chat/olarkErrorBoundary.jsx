import { Component } from 'react';

class OlarkErrorBoundary extends Component {
	componentDidCatch( error, errorInfo ) {
		// TODO: Catch error
	}

	render() {
		return this.props.children;
	}
}

export default OlarkErrorBoundary;
