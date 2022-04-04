import { Component } from 'react';

class OlarkErrorBoundary extends Component {
	constructor( props ) {
		super( props );
		this.state = { error: null, errorInfo: null };
	}

	componentDidCatch( error, errorInfo ) {
		this.setState( {
			error: error,
			errorInfo: errorInfo,
		} );
	}

	render() {
		if ( this.state.errorInfo ) {
			return null;
		}
		return this.props.children;
	}
}

export default OlarkErrorBoundary;
