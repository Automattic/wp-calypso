/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';

/**
 * Style dependencies
 */
import './style.scss';

export default class extends React.Component {
	static displayName = 'EditorFieldset';

	static propTypes = {
		legend: PropTypes.oneOfType( [ PropTypes.string, PropTypes.element ] ).isRequired,
	};

	renderChildren = () => {
		return React.Children.map( this.props.children, function ( child ) {
			return <div className="editor-fieldset__option">{ child }</div>;
		} );
	};

	render() {
		return (
			<FormFieldset className={ classNames( 'editor-fieldset', this.props.className ) }>
				<legend className="editor-fieldset__legend">{ this.props.legend }</legend>
				{ this.renderChildren() }
			</FormFieldset>
		);
	}
}
