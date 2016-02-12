/**
 * External dependencies
 */
import React from 'react';
import classNames from  'classnames';
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import FormTextInput from 'components/forms/form-text-input';

export default React.createClass( {
	displayName: 'FormTextInputWithAffixes',

	propTypes: {
		noWrap: React.PropTypes.bool,
		prefix: React.PropTypes.string,
		suffix: React.PropTypes.string
	},

	render() {
		return (
			<div className={ classNames( 'form-text-input-with-affixes', { 'no-wrap': this.props.noWrap } ) }>
				{ this.props.prefix && (
					<span className="form-text-input-with-affixes__prefix">
						{ this.props.prefix }
					</span>
				) }

				<FormTextInput { ...omit( this.props, this.constructor.propTypes ) } />

				{ this.props.suffix && (
					<span className="form-text-input-with-affixes__suffix">
						{ this.props.suffix }
					</span>
				) }
			</div>
		);
	}
} );
