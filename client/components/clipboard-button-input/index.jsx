/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { withoutHttp } from 'calypso/lib/url';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

function ClipboardButtonInput( { value = '', className, disabled, hideHttp, dispatch, ...rest } ) {
	const translate = useTranslate();

	const [ isCopied, setCopied ] = React.useState( false );

	// toggle the `isCopied` flag back to `false` after 4 seconds
	React.useEffect( () => {
		if ( isCopied ) {
			const confirmationTimeout = setTimeout( () => setCopied( false ), 4000 );
			return () => clearTimeout( confirmationTimeout );
		}
	}, [ isCopied ] );

	const showConfirmation = () => {
		setCopied( true );
		dispatch( recordTracksEvent( 'calypso_editor_clipboard_url_button_click' ) );
	};

	return (
		<span className={ classnames( 'clipboard-button-input', className ) }>
			<FormTextInput
				{ ...rest }
				disabled={ disabled }
				value={ hideHttp ? withoutHttp( value ) : value }
				selectOnFocus
				readOnly
			/>
			<ClipboardButton text={ value } onCopy={ showConfirmation } disabled={ disabled } compact>
				{ isCopied ? translate( 'Copied!' ) : translate( 'Copy', { context: 'verb' } ) }
			</ClipboardButton>
		</span>
	);
}

ClipboardButtonInput.propTypes = {
	value: PropTypes.string,
	disabled: PropTypes.bool,
	className: PropTypes.string,
	hideHttp: PropTypes.bool,
};

export default connect()( ClipboardButtonInput );
