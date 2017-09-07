/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutHttp } from 'lib/url';
import ClipboardButton from 'components/forms/clipboard-button';
import FormTextInput from 'components/forms/form-text-input';

export default React.createClass( {
	displayName: 'ClipboardButtonInput',

	propTypes: {
		value: PropTypes.string,
		disabled: PropTypes.bool,
		className: PropTypes.string,
		hideHttp: PropTypes.bool
	},

	getInitialState() {
		return {
			isCopied: false,
			disabled: false
		};
	},

	getDefaultProps() {
		return {
			value: ''
		};
	},

	componentWillUnmount() {
		clearTimeout( this.confirmationTimeout );
		delete this.confirmationTimeout;
	},

	showConfirmation() {
		this.setState( {
			isCopied: true
		} );

		this.confirmationTimeout = setTimeout( () => {
			this.setState( {
				isCopied: false
			} );
		}, 4000 );
	},

	render() {
		const { value, className, disabled, hideHttp } = this.props;
		const classes = classnames( 'clipboard-button-input', className );

		return (
			<span className={ classes }>
				<FormTextInput
					{ ...omit( this.props, 'className', 'hideHttp' ) }
					value={ hideHttp ? withoutHttp( value ) : value }
					type="text"
					selectOnFocus
					readOnly />
				<ClipboardButton
					text={ value }
					onCopy={ this.showConfirmation }
					disabled={ disabled }
					compact>
					{ this.state.isCopied
						? this.translate( 'Copied!' )
						: this.translate( 'Copy', { context: 'verb' } ) }
				</ClipboardButton>
			</span>
		);
	}
} );
