/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormFieldset from 'calypso/components/forms/form-fieldset';

/**
 * Style dependencies
 */
import './fieldset.scss';

export default class extends React.Component {
	static displayName = 'EditorMediaModalFieldset';

	static propTypes = {
		legend: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ).isRequired,
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
