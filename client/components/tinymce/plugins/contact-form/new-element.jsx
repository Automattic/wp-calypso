import React from 'react';

export default React.createClass({
	render() {
		return <div className="add">
				<a href='#' onClick={this.props.onClick}>+</a>
			</div>
	}
});
