/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import React, { Children } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const FormButton = React.createClass( {
	getDefaultProps() {
		return {
			isSubmitting: false,
			isPrimary: true,
			type: 'submit'
		};
	},

	getDefaultButtonAction() {
		return this.props.isSubmitting ? this.props.translate( 'Saving…' ) : this.props.translate( 'Save Settings' );
	},

	render() {
		const { children, className, isPrimary, ...props } = this.props,
			buttonClasses = classNames( className, {
				'form-button': true
			} );

		return (
			<Button
				{ ...omit( props, 'isSubmitting' ) }
				primary={ isPrimary }
				className={ buttonClasses }>
				{ Children.count( children ) ? children : this.getDefaultButtonAction() }
			</Button>
		);
	}
} );

export default localize( FormButton );
