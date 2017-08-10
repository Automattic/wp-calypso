/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { keys, omit } from 'lodash';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

export default class extends React.Component {
	static displayName = 'FormTextInputWithAffixes';

	static propTypes = {
		noWrap: PropTypes.bool,
		prefix: PropTypes.string,
		suffix: PropTypes.string,
	};

	render() {
		return (
			<div
				className={ classNames( 'form-text-input-with-affixes', { 'no-wrap': this.props.noWrap } ) }
			>
				{ this.props.prefix &&
					<span className="form-text-input-with-affixes__prefix">
						{ this.props.prefix }
					</span> }

				<FormTextInput { ...omit( this.props, keys( this.constructor.propTypes ) ) } />

				{ this.props.suffix &&
					<span className="form-text-input-with-affixes__suffix">
						{ this.props.suffix }
					</span> }
			</div>
		);
	}
}
