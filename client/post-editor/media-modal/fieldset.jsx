import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import './fieldset.scss';

export default class extends React.Component {
	static displayName = 'EditorMediaModalFieldset';

	static propTypes = {
		legend: PropTypes.node.isRequired,
	};

	render() {
		return (
			<FormFieldset
				className={ classNames( 'editor-media-modal__fieldset', this.props.className ) }
			>
				<legend className="editor-media-modal__fieldset-legend">{ this.props.legend }</legend>
				{ this.props.children }
			</FormFieldset>
		);
	}
}
