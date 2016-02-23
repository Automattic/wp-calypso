import React from 'react';

class ClientSideEffects extends React.Component {
	constructor() {
		super();
	}
	componentDidMount() {
		this.props.children();
	}
	render() {
		return null;
	}
};

ClientSideEffects.propTypes = {
	children: React.PropTypes.func.isRequired
};

ClientSideEffects.defaultProps = {
	children: () => {}
};

export default ClientSideEffects;
