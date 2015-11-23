import React from 'react';

export default React.createClass({
	getInitialState() {
		this.lastKey = 0;

		return { 
			options: [
				{ key: 0, text: ''}
			],
			validation: [ true ]
		};
	},

	isValid() {
		var isValid = true;

		for(var index in this.state.validation) {
			if(!this.state.validation[index]) {
				isValid = false;
				break;
			}
		}

		return isValid;
	},

	getOptions(){
		return this.state.options.map(option => {
			return option.text;
		});
	},

	onAdd(e) {
		e.preventDefault();

		var options = this.state.options;
		options.push({ key: ++this.lastKey, text: ''});

		var validation = this.state.validation;
		validation.push(true);

		this.setState({ options: options, validation: validation });
	},

	onTextChange(index, e) {
		var options = this.state.options;
		var validation = this.state.validation;

		validation[index] = e.target.checkValidity();

		options[index].text = e.target.value;

		this.setState({ options: options, validation: validation });
	},

	onDelete(index, e) {
		e.preventDefault();

		var options = this.state.options;
		options.splice(index, 1);

		var validation = this.state.validation;
		validation.splice(index, 1);

		this.setState({ options: options, validation: validation });
	},

	render() {
		var options = this.state.options.map( (option, index) => {
			let optionClassName = !this.state.validation[index] ? 'invalid' : null;
			return <div key={option.key} className="option">
				<input type="text" className={optionClassName} placeholder="option text" required value={option.text} onChange={this.onTextChange.bind(this, index)} /><a href="#" onClick={this.onDelete.bind(this, index)}>remove</a>
			</div>;
		});
		return <div className="options">
			{{options}}
			<div className="addOption">
				<a href="#" onClick={this.onAdd}>add another option</a>
			</div>
		</div>
	}
});
