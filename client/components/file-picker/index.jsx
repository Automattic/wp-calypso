/**
 * External dependencies
 */

import PropTypes from 'prop-types';
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
	multiple: PropTypes.bool,
	directory: PropTypes.bool,
	accept: PropTypes.string,
	onClick: PropTypes.func,
	onPick: PropTypes.func,
};

FilePicker.defaultProps = {
	multiple: false,
	directory: false,
	accept: null,
	onClick: noop,
	onPick: noop,
};
