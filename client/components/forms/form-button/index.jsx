import { Button } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import { Component, Children } from 'react';

import './style.scss';

class FormButton extends Component {
	static defaultProps = {
		isSubmitting: false,
		isPrimary: true,
		type: 'submit',
	};

	getDefaultButtonAction = () => {
		return this.props.isSubmitting
			? this.props.translate( 'Saving…' )
			: this.props.translate( 'Save Settings' );
	};

	render() {
		const { children, className, isPrimary, ...props } = this.props;
		const buttonClasses = clsx( className, 'form-button' );

		return (
			<Button
				{ ...omit( props, [ 'isSubmitting', 'moment', 'numberFormat', 'translate' ] ) }
				primary={ isPrimary }
				className={ buttonClasses }
			>
				{ Children.count( children ) ? children : this.getDefaultButtonAction() }
			</Button>
		);
	}
}

export default localize( FormButton );
