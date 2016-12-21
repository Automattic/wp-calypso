/**
 * External Dependencies
 */

import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */

import Gridicon from 'components/gridicon';

/**
 * A row for the props-editor table
 */
class TableRow extends PureComponent {
	componentWillMount() {
		this.setState( {
			editing: false,
			value: this.props.value,
			defaultValue: this.props.value
		} );
	}

	componentWillReceiveProps( nextProps ) {
		this.setState( {
			editing: false,
			value: nextProps.value,
			defaultValue: nextProps.value
		} );
	}

	componentWillUnmount() {
		this.editorRef = null;
	}

	/**
	 * Makes it so that a user may edit the current value on the table
	 */
	makeEditable = () => {
		this.setState( {
			editing: true
		}, () => {
			if ( this.editorRef ) {
				this.editorRef.focus();
			}
		} );
	};

	/**
	 * Updates the value, given an event from react
	 * @param {SyntheticEvent} event The event with the new content
	 */
	updateValue = ( event ) => {
		this.setState( {
			value: event.target.textContent
		} );
	};

	/**
	 * Called when the user presses enter and we want to stop editing
	 * @param {SyntheticEvent} event The event from the keyboard
	 */
	blurish = ( event ) => {
		if ( event.key === 'Enter' ) {
			if ( this.editorRef ) {
				this.editorRef.blur();
			}
		}
	};

	/**
	 * Called when the user leaves the input on the row, it calls the callback passed via props with the new value.
	 */
	setValue = () => {
		this.setState( {
			editing: false
		}, () => {
			if ( this.props.onChange ) {
				this.props.onChange( this.state.value );
			}
		} );
	};

	/**
	 * Resets the value back to the defaultValue
	 */
	resetValue = () => {
		if ( this.editorRef ) {
			this.editorRef.blur();
		}

		this.setState( {
			editing: false,
			value: this.state.defaultValue
		} );
	};

	/**
	 * Stores the ref to the div that is editable
	 * @param {Ref} ref The ref to the editable div
	 */
	editor = ( ref ) => {
		this.editorRef = ref;
	};

	render() {
		const requiredClasses = classnames( {
			'props-editor__table-row-required': this.props.required,
			'props-editor__table-row-optional': ! this.props.required,
		} );

		const rowClass = classnames( {
			'props-editor__unknown-type': this.props.type === 'unknown'
		} );

		const type = this.props.holds === 'unknown' || this.props.holds === 'null'
			? this.props.type
			: `${ this.props.type }( ${ this.props.holds } )`;

		return (
			<tr className={ rowClass }>
				<td className="props-editor__table-row-name">
					{ this.props.name }
				</td>
				<td className="props-editor__table-row-type">
					{ type }
				</td>
				<td className={ requiredClasses }>
					{ this.props.required ? 'required' : 'optional' }
				</td>
				<td className="props-editor__table-row-current" onClick={ this.makeEditable }>
					<div
						ref={ this.editor }
						contentEditable={ this.state.editing }
						onInput={ this.updateValue }
						onBlur={ this.setValue }
						onKeyDown={ this.blurish }
					>
						{ this.state.value }
					</div>
					{ this.state.defaultValue !== this.state.value
						? <Gridicon icon="undo" onClick={ this.resetValue } />
						: null }
				</td>
				<td className="props-editor__table-row-default">
					{ this.props.defaultValue }
				</td>
				<td className="props-editor__table-row-description">
					{ this.props.type === 'unknown'
						? <p>This prop is missing from propTypes!</p>
						: this.props.description }
				</td>
			</tr>
		);
	}
}

TableRow.propTypes = {
	/**
	 * The prop's default value
	 */
	defaultValue: PropTypes.any,

	/**
	 * A description of the prop
	 */
	description: PropTypes.string,

	/**
	 * If the type is a container type (such as an array), this is the type that it holds
	 */
	holds: PropTypes.string,

	/**
	 * The name of the prop
	 */
	name: PropTypes.string.isRequired,

	/**
	 * Called when the user edits the current value
	 */
	onChange: PropTypes.func,

	/**
	 * Whether or not the prop is required
	 */
	required: PropTypes.bool,

	/**
	 * The type of the prop, a string from just after `PropTypes.`
	 */
	type: PropTypes.string.isRequired,

	/**
	 * The starting value of the prop
	 */
	value: PropTypes.any.isRequired
};

export default TableRow;
