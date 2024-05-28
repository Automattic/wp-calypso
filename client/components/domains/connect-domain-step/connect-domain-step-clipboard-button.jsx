import { Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ClipboardButton from 'calypso/components/forms/clipboard-button';

import './style.scss';

export default function ConnectDomainStepClipboardButton( { baseClassName, classes, text } ) {
	const { __ } = useI18n();
	const [ copiedText, setCopiedText ] = useState( false );
	const copied = () => setCopiedText( true );
	const buttonClasses = classNames( baseClassName + '__clipboard-button', ...classes );
	const stateClasses = classNames( baseClassName + '__clipboard-button-state', {
		[ baseClassName + '__clipboard-button-blue' ]: ! copiedText,
	} );
	const dataClasses = classNames(
		baseClassName + '__clipboard-button-data',
		baseClassName + '__clipboard-button-text'
	);

	return (
		<ClipboardButton className={ buttonClasses } text={ text } onCopy={ copied } borderless>
			<span className={ dataClasses }>{ text }</span>
			<div className={ stateClasses }>
				<Gridicon
					className={ baseClassName + '__clipboard-button-state-icon' }
					icon="next-page"
					size={ 20 } /* eslint-disable-line */
				/>
				<span className={ baseClassName + '__clipboard-button-state-text' }>
					{ copiedText ? __( 'Copied!' ) : __( 'Copy' ) }
				</span>
			</div>
		</ClipboardButton>
	);
}

ConnectDomainStepClipboardButton.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	classes: PropTypes.array,
	text: PropTypes.string.isRequired,
};
