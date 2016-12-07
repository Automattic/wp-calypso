/**
 * External Dependencies
 */

import React, { PureComponent } from 'react';
import classnames from 'classnames';

/**
 * Internal Dependencies
 */

import Gridicon from 'components/gridicon';

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

	makeEditable = () => {
		this.setState( {
			editing: true
		}, () => {
			if ( this.editorRef ) {
				this.editorRef.focus();
			}
		} );
	};

	updateValue = ( event ) => {
		this.setState( {
			value: event.target.textContent
		} );
	};

	blurish = ( event ) => {
		if ( event.key === 'Enter' ) {
			if ( this.editorRef ) {
				this.editorRef.blur();
			}
		}
	};

	setValue = () => {
		this.setState( {
			editing: false
		}, () => {
			if ( this.props.onChange ) {
				this.props.onChange( this.state.value );
			}
		} );
	};

	resetValue = () => {
		if ( this.editorRef ) {
			this.editorRef.blur();
		}

		this.setState( {
			editing: false,
			value: this.state.defaultValue
		} );
	};

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

export default TableRow;
