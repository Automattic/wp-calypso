/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import omit from 'lodash.omit';

/**
 * Internal dependencies
 */
import FormNumberInput from '../form-number-input';

export default class FormNumberInputWithAffixes extends React.Component {
	static propTypes = {
		noWrap: PropTypes.bool,
		prefix: PropTypes.string,
		suffix: PropTypes.string,
	}

	render() {
		const { noWrap, prefix, suffix } = this.props;
		const passThruProps = omit( this.props, [ 'noWrap', 'prefix', 'suffix' ] );

		const className = classNames( {
			'form-number-input-with-affixes': true,
			'no-wrap': noWrap
		} );

		return (
			<div className={ className } >
				{ prefix && (
					<span className="form-number-input-with-affixes__prefix">
						{ prefix }
					</span>
				) }

				<FormNumberInput { ...passThruProps } />

				{ suffix && (
					<span className="form-number-input-with-affixes__suffix">
						{ suffix }
					</span>
				) }
			</div>
		);
	}
}

