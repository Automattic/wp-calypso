import { Button } from '@automattic/components';
import { omit } from '@automattic/js-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component, Children, createRef } from 'react';

import './style.scss';

class FormButton extends Component {
	static defaultProps = {
		isSubmitting: false,
		isPrimary: true,
		type: 'submit',
	};

	buttonRef = createRef();

	getDefaultButtonAction = () => {
		return this.props.isSubmitting
			? this.props.translate( 'Saving…' )
			: this.props.translate( 'Save Settings' );
	};

	getDOMNode = () => this.buttonRef.current;

	render() {
		const { children, className, isPrimary, ...props } = this.props;
		const buttonClasses = clsx( className, 'form-button' );

		return (
			<Button
				{ ...omit( props, [ 'isSubmitting', 'moment', 'numberFormat', 'translate' ] ) }
				ref={ this.buttonRef }
				primary={ isPrimary }
				className={ buttonClasses }
			>
				{ Children.count( children ) ? children : this.getDefaultButtonAction() }
			</Button>
		);
	}
}

export default localize( FormButton );
