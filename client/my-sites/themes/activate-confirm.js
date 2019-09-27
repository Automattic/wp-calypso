/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

export default function ActivateConfirm( { isVisible, onClose, themeName } ) {
	const confirmLabel = translate( 'Activate %(theme)s', {
		args: { theme: themeName },
	} );
	const buttons = [
		{ action: 'cancel', label: translate( 'Keep current theme' ), isPrimary: true },
		{ action: 'confirm', label: confirmLabel },
	];
	const props = { isVisible, onClose };
	const message = translate(
		'{{strong}}%(theme)s{{/strong}} does not fully support editing headers and footers. ' +
			'Any changes you have made will not be displayed on your site. You will need to use ' +
			'the legacy Customizer tool to edit some areas of your site.',
		{
			components: { strong: <strong /> },
			args: { theme: themeName },
		}
	);
	return (
		<Dialog { ...props } buttons={ buttons }>
			<p>{ message }</p>
		</Dialog>
	);
}
