/** @ssr-ready **/

/**
 * External dependencies
 */
import React from 'react';
import assign from 'lodash/assign';
import noop from 'lodash/noop';
import pick from 'component-file-picker';

export default class FilePicker extends React.Component {
	constructor( props ) {
		super( props );
		this.showPicker = this.showPicker.bind( this );
	}

	showPicker() {
		pick( assign( {}, this.props ), this.props.onPick );
	}

	render() {
		return (
			<span className="file-picker" onClick={ this.showPicker } >
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
	onPick: React.PropTypes.func
};

FilePicker.defaultProps = {
	multiple: false,
	directory: false,
	accept: null,
	onPick: noop
};
