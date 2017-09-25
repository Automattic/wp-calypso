/**
 * External dependencies
 */
import classNames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

export default class extends React.Component {
	static displayName = 'FormSettingExplanation';

	static propTypes = {
		noValidate: PropTypes.bool,
		isIndented: PropTypes.bool,
		className: PropTypes.string,
	};

	static defaultProps = {
		noValidate: false,
		isIndented: false,
	};

	render() {
		const classes = classNames( this.props.className, 'form-setting-explanation', {
			'no-validate': this.props.noValidate,
			'is-indented': this.props.isIndented,
		} );

		return (
			<p { ...omit( this.props, 'className', 'noValidate', 'isIndented' ) } className={ classes }>
				{ this.props.children }
			</p>
		);
	}
}
