import React from 'react';
import Options from './option-list';

export default React.createClass({
	mixins: [React.addons.LinkedStateMixin],

	getInitialState() {
		var field = this.props.field;

		return { 
			label: field.label,
			placeholder: field.placeholder,
			type: field.type,
			required: field.required,
			expanded: false,
			isValid: !!field.label
		};
	},

	isValid() {
		if(!this.state.expanded){
			return false;
		}

		var isValid = this.refs.label.getDOMNode().checkValidity();
		this.setState({ isValid: isValid });

		if(this.refs.fieldOptions) {
			isValid &= this.refs.fieldOptions.isValid();
		}

		return isValid;
	},

	onEdit(e) {
		e.preventDefault();

		this.setState({ expanded: true });
	},

	onSave(e) {
		e.preventDefault();

		if(!this.isValid()) {
			return;
		}

		var field = {
			label: this.state.label,
			placeholder: this.state.placeholder,
			type: this.state.type,
			required: this.state.required
		};

		if(this.refs.fieldOptions) {
			field["options"] = this.refs.fieldOptions.getOptions();
		}

		this.props.onUpdate(field, this.props.index);

		this.setState({ expanded: false });
	},

	onDelete(e) {
		e.preventDefault();

		this.props.onDelete(this.props.index);
	},

	render() {

		var header;
		if(this.state.expanded) {
			let className = !this.state.isValid ? 'invalid' : null;
			header = <div className="header edit">
				<input ref="label" type="text" className={className} valueLink={this.linkState('label')} required></input>
				<a href="#" onClick={this.onSave}>done</a>
			</div>;
		} else {
			header = <div className="header">
				<span className="grab">&#8942;&#8942;&#8942;</span>
				<span className="label">{this.state.label}</span>
				<a href="#" onClick={this.onEdit}>edit</a>
			</div>;
		}

		var placeholder, options;
		if(['dropdown', 'radio'].indexOf(this.state.type) >= 0) {
			options = <Options ref="fieldOptions" />;
		} else {
			placeholder = <div>
					<label>Placeholder Text</label>
					<input type="text" placeholder="optional placeholder text" valueLink={this.linkState('placeholder')}></input>
				</div>;
		}

		let className = this.state.expanded ? 'details expanded' : 'details';

		return <div className="field" data-index={this.props.index} draggable={!this.state.expanded} onDragStart={this.props.onDragStart} onDragEnd={this.props.onDragEnd}>
			{header}
			<div className={className}>
				{placeholder}
				<div>
					<label>Field Type</label>
					<select valueLink={this.linkState('type')}>
						<option value="checkbox">Checkbox</option>
						<option value="dropdown">Dropdown</option>
						<option value="email">Email</option>
						<option value="name">Name</option>
						<option value="radio">Radio</option>
						<option value="text">Text</option>
						<option value="textarea">Textarea</option>
						<option value="website">Website</option>
					</select>
				</div>
				{options}
				<div className="required">
					<label><input type="checkbox" checkedLink={this.linkState('required')} />Required</label>
				</div>
				<div className="delete">
					<a href="#" onClick={this.onDelete}>Delete Field</a>
				</div>
			</div>
		</div>
	}
});
