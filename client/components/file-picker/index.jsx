/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

export default class FilePicker extends React.Component {

	getFileAttributes() {
		return {
			multiple: this.props.multiple,
			webkitDirectory: this.props.directory,
			mozDirectory: this.props.directory,
			msDirectory: this.props.directory,
			oDirectory: this.props.directory,
			directory: this.props.directory,
			accept: this.props.accept
		};
	}

	// This method is only required until React adds directory to their whitelist.
	// @see https://github.com/facebook/react/issues/3468
	// Once it is added, `setFileDirectoryAttribute`, `componentDidMount` and
	// `componentDidUpdate` methods can be removed.
	// Note: they are already included in the `getFileAttributes` method.
	setFileDirectoryAttribute() {
		if ( this.props.directory ) {
			const fileInput = this.refs.fileInput;
			fileInput.setAttribute( 'webkitdirectory', '' );
			fileInput.setAttribute( 'mozdirectory', '' );
			fileInput.setAttribute( 'msdirectory', '' );
			fileInput.setAttribute( 'odirectory', '' );
			fileInput.setAttribute( 'directory', '' );
		}
	}

	componentDidMount() {
		this.setFileDirectoryAttribute();
	}

	componentDidUpdate() {
		this.setFileDirectoryAttribute();
	}

	render() {
		const formStyle = {
			position: 'relative',
			width: '0px',
			height: '0px',
			overflow: 'hidden'
		};
		const inputStyle = {
			top: '-1000px',
			position: 'absolute'
		};
		return (
			<span className="file-picker">
				<span onClick={ () => this.refs.fileInput.click() } >
					{ this.props.children }
				</span>
				<form style={ formStyle } >
					<input type="file" { ...this.getFileAttributes() } style={ inputStyle } aria-hidden="true" ref="fileInput" onChange={ this.onChange.bind( this ) }  />
				</form>
			</span>
		);
	}

	onChange( event ) {
		this.props.onPick( this.refs.fileInput.files );
	}
}

FilePicker.displayName = 'FilePicker';

FilePicker.propTypes = {
	multiple: React.PropTypes.bool,
	directory: React.PropTypes.bool,
	accept: React.PropTypes.string,
	onPick: React.PropTypes.func.isRequired
};

FilePicker.defaultProps = {
	multiple: false,
	directory: false,
	accept: null,
	onPick: noop
};
