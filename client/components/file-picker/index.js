/**
 * External dependencies
 */
import React from 'react';
import { assign, noop } from 'lodash';
import pick from 'component-file-picker';

export default class FilePicker extends React.Component {
	constructor( props ) {
		super( props );
		this.showPicker = this.showPicker.bind( this );
	}

	showPicker() {
		this.props.onClick();
		pick( assign( {}, this.props ), this.props.onPick );
	}

	render() {
		return (
			<span className="file-picker" onClick={ this.showPicker }>
				{ this.props.children }
			</span>
		);
	}
}

FilePicker.displayName = 'FilePicker';

FilePicker.propTypes = {
	multiple: React.PropTypes.bool,
	directory: React.PropTypes.bool,
	accept: React.PropTypes.string,
	onClick: React.PropTypes.func,
	onPick: React.PropTypes.func,
};

FilePicker.defaultProps = {
	multiple: false,
	directory: false,
	accept: null,
	onClick: noop,
	onPick: noop
};
