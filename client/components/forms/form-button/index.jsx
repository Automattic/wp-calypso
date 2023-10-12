import { Button } from '@wordpress/components';
import classNames from 'classnames';
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
		const { children, className, isPrimary, isSubmitting, ...props } = this.props;
		const buttonClasses = classNames( className, 'form-button' );

		return (
			<Button
				{ ...omit( props, [ 'isSubmitting', 'moment', 'numberFormat', 'translate' ] ) }
				variant={ isPrimary ? 'primary' : 'secondary' }
				className={ buttonClasses }
				isBusy={ isSubmitting }
			>
				{ Children.count( children ) ? children : this.getDefaultButtonAction() }
			</Button>
		);
	}
}

export default localize( FormButton );
