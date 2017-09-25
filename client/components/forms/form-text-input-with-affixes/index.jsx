/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

export default class extends React.Component {
	static displayName = 'FormTextInputWithAffixes';

	static propTypes = {
		noWrap: PropTypes.bool,
		prefix: PropTypes.node,
		suffix: PropTypes.node,
	};

	render() {
		const { noWrap, prefix, suffix, ...rest } = this.props;

		return (
			<div className={ classNames( 'form-text-input-with-affixes', { 'no-wrap': noWrap } ) }>
				{ prefix && <span className="form-text-input-with-affixes__prefix">{ prefix }</span> }

				<FormTextInput { ...rest } />

				{ suffix && <span className="form-text-input-with-affixes__suffix">{ suffix }</span> }
			</div>
		);
	}
}
