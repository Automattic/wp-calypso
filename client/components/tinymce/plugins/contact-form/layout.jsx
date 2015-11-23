import React from 'react/addons';

import Menu from './menu';
import List from './list';
import New from './new-element';

export default React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	displaName: 'Layout',

	getInitialState() {
		return {
			selectedTab: 'edit',
			email: '',
			subject: '',
			fields: [
				{ key: 0, label: 'Name',    placeholder: '', required: true,  type: 'name' },
				{ key: 1, label: 'Email',   placeholder: '', required: true,  type: 'email'},
				{ key: 2, label: 'Website', placeholder: '', required: false, type: 'website'},
				{ key: 3, label: 'Comment', placeholder: '', required: true,  type: 'textarea'}
			]
		};
	},

	getForm() {
		return {
			settings: {
				email: this.state.email,
				subject: this.state.subject
			},
			fields: this.state.fields
		};
	},

	onTabClick(tab) {
		this.setState({ selectedTab: tab });
	},

	onAdd(e) {
		e.preventDefault();

		var fields = this.state.fields;
		fields.push({
			label: 'New Field',
			placeholder: '',
			required: false,
			type: 'text'
		});

		this.setState({ fields: fields });
	},

	onUpdate(field, index) {
		var fields = this.state.fields;
		fields[index] = field;

		this.setState({ fields: fields });
	},

	onDelete(index) {
		var fields = this.state.fields;
		fields.splice(index, 1);

		this.setState({ fields: fields });
	},

	onMove(fromIndex, toIndex) {
		if(fromIndex === toIndex) {
			return;
		}

		if(fromIndex < toIndex) {
			toIndex--;
		}

		var fields = this.state.fields;
		fields.splice(toIndex, 0, fields.splice(fromIndex, 1)[0]);

		this.setState({ fields: fields });
	},

	contentFactory(tab) {
		let tabRenders = {
			settings() {
				return <div className="settings">
					<div className="field">
						<label>Email</label>
						<input type="text" placeholder="enter your email address" valueLink={this.linkState('email')}></input>
					</div>
					<div className="field">
						<label>Subject</label>
						<input type="text" placeholder="What should the subject line be?" valueLink={this.linkState('subject')}></input>
					</div>
				</div>;
			},

			edit() {
				return <div className="form-fields">
					<List
						fields={this.state.fields}
						onUpdate={this.onUpdate}
						onDelete={this.onDelete}
						onMove={this.onMove}
					/>
					<New onClick={this.onAdd} />
				</div>
			}
		}

		return tabRenders[tab].apply(this);
	},

	render() {
		let content = this.contentFactory(this.state.selectedTab);

		return <div className="contact-form-generator">
				<Menu onClick={this.onTabClick} />
				{content}
			</div>;
	}
});
