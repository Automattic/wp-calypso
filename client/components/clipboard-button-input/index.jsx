/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { omit } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { withoutHttp } from 'lib/url';
import ClipboardButton from 'components/forms/clipboard-button';
import FormTextInput from 'components/forms/form-text-input';

class ClipboardButtonInputExport extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			isCopied: false,
			disabled: false,
		};
	}
	static propTypes = {
		value: PropTypes.string,
		disabled: PropTypes.bool,
		className: PropTypes.string,
		hideHttp: PropTypes.bool,
		moment: PropTypes.func,
		numberFormat: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		value: '',
	};

	componentWillUnmount() {
		clearTimeout( this.confirmationTimeout );
		delete this.confirmationTimeout;
	}

	showConfirmation = () => {
		this.setState( {
			isCopied: true,
		} );

		this.confirmationTimeout = setTimeout( () => {
			this.setState( {
				isCopied: false,
			} );
		}, 4000 );
	};

	render() {
		const { value, className, disabled, hideHttp, translate } = this.props;
		const classes = classnames( 'clipboard-button-input', className );

		return (
			<span className={ classes }>
				<FormTextInput
					{ ...omit( this.props, 'className', 'hideHttp', 'moment', 'numberFormat', 'translate' ) }
					value={ hideHttp ? withoutHttp( value ) : value }
					type="text"
					selectOnFocus
					readOnly
				/>
				<ClipboardButton
					text={ value }
					onCopy={ this.showConfirmation }
					disabled={ disabled }
					compact
				>
					{ this.state.isCopied
						? translate( 'Copied!' )
						: translate( 'Copy', { context: 'verb' } ) }
				</ClipboardButton>
			</span>
		);
	}
}

export default localize( ClipboardButtonInputExport );
