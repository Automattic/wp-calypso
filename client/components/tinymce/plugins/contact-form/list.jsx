import React from 'react';

// import closest from 'closest';

import Field from './field';

var placeholder = document.createElement("div");
placeholder.className = "placeholder";

export default React.createClass({
	onDragStart(e) {
		this.dragged = e.currentTarget;

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData("text/html", e.currentTarget);
	},

	onDragEnd(e) {
		if(!this.dragged) {
			return;
		}

		this.dragged.style.display = 'block';
		this.dragged.parentNode.removeChild(placeholder);

		var from = Number(this.dragged.dataset.index);
		var to = Number(this.dragTarget.dataset.index);

		if(this.placeholderAfter) {
			to++;
		}

		this.props.onMove(from, to);
	},

	onDragOver(e) {
		e.preventDefault();

		if(!this.dragged) {
			return;
		}
		this.dragged.style.display = 'none';

		if(e.target.className === 'placeholder') {
			return;
		}

		// var list = closest(e.target, '.list', true);
		// var field = closest(e.target, '.field', true);

		// if (list && field) {
		// 	this.dragTarget = field;

		// 	var top = field.getBoundingClientRect().top;
		// 	var y = e.clientY - top;
		// 	var height = field.offsetHeight / 2;

		// 	this.placeholderAfter = y > height;

		// 	list.insertBefore(placeholder, this.placeholderAfter ? field.nextElementSibling : field);
		// }
	},

	render() {
		if(this.props.fields.length > 0) {

			var items = this.props.fields.map( (field, index) => {
				return <Field
					key={'field-' + index + field.label}
					index={index}
					field={field}
					onUpdate={this.props.onUpdate}
					onDelete={this.props.onDelete}
					onDragStart={this.onDragStart}
					onDragEnd={this.onDragEnd}
				/>
			});

			return <div className="list" onDragOver={this.onDragOver}>
					{items}
				</div>;
		}

		return null;
	}
});
