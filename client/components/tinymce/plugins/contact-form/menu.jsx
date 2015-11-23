import React from 'react';

export default React.createClass({
	getInitialState() {
		return{
			selected: 0,
			tabs: [
				{ key: 'edit', label: 'Edit Form'},
				{ key: 'settings', label: 'Settings'}
			]
		}
	},

	onClick(index, e) {
		e.preventDefault();

		let tab = this.state.tabs[index];

		this.setState({ selected: index });
		this.props.onClick(tab.key);
	},

	render() {
		var tabs = this.state.tabs.map( (tab, index) => {
			let className = this.state.selected === index ? 'selected' : null;
			return <li key={tab.key} className={className}><a href="#" onClick={this.onClick.bind(this, index)}>{tab.label}</a></li>;
		});
		return <ul>{tabs}</ul>;
	}
});
