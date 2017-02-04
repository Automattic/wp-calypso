import { Children, Component, PropTypes } from 'react';

class Stylizer extends Component {
	static propTypes = {
		children: PropTypes.element.isRequired,
		onInsertCss: PropTypes.func.isRequired
	};

	static childContextTypes = {
		insertCss: PropTypes.func.isRequired
	};

	getChildContext() {
		return { insertCss: this.props.onInsertCss };
	}

	render() {
		return Children.only( this.props.children );
	}
}

export default Stylizer;

export function insertCss( styles ) {
	// _insertCss is injected by the isomorphic-style-loader
	// so it might not be available if we disable this loader on the server
	return styles._insertCss && styles._insertCss();
}
