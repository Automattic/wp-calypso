/**
 * External dependencies
 */
import classNames from 'classnames';
import { isEmpty, omit } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

export default React.createClass( {

	displayName: 'FormsButton',

	getDefaultProps() {
		return {
			isSubmitting: false,
			isPrimary: true,
			type: 'submit'
		};
	},

	getDefaultButtonAction() {
		return this.props.isSubmitting ? this.translate( 'Saving…' ) : this.translate( 'Save Settings' );
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
				{ isEmpty( children ) ? this.getDefaultButtonAction() : children }
			</Button>
		);
	}
} );
