import PropTypes from 'prop-types';
import { Component } from 'react';
import pick from './component-file-picker';

const noop = () => {};

export default class FilePicker extends Component {
	constructor( props ) {
		super( props );
		this.showPicker = this.showPicker.bind( this );
	}

	showPicker() {
		this.props.onClick();
		pick( { ...this.props }, this.props.onPick );
	}

	render() {
		return (
			// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
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
