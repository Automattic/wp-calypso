/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';
import IconButton from '../icon-button';

class FormFileUpload extends Component {
	constructor() {
		super( ...arguments );
		this.openFileDialog = this.openFileDialog.bind( this );
		this.bindInput = this.bindInput.bind( this );
	}

	openFileDialog() {
		this.input.click();
	}

	bindInput( ref ) {
		this.input = ref;
	}

	render() {
		const { children, multiple = false, accept, onChange, icon = 'upload', ...props } = this.props;

		return (
			<div className="components-form-file-upload">
				<IconButton
					icon={ icon }
					onClick={ this.openFileDialog }
					{ ...props }
				>
					{ children }
				</IconButton>
				<input
					type="file"
					ref={ this.bindInput }
					multiple={ multiple }
					style={ { display: 'none' } }
					accept={ accept }
					onChange={ onChange }
				/>
			</div>
		);
	}
}

export default FormFileUpload;
