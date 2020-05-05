/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

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
			<fieldset className={ classNames( 'editor-media-modal__fieldset', this.props.className ) }>
				<legend className="editor-media-modal__fieldset-legend">{ this.props.legend }</legend>
				{ this.props.children }
			</fieldset>
		);
	}
}
