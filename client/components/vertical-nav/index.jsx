import { Component } from 'react';

import './style.scss';

class VerticalNav extends Component {
	render() {
		return <div className="vertical-nav">{ this.props.children }</div>;
	}
}

export default VerticalNav;
