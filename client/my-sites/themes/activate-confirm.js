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
		{ action: 'confirm', label: confirmLabel },
		{ action: 'cancel', label: translate( 'Keep current theme' ), isPrimary: true },
	];
	const props = { isVisible, onClose };
	const first = translate(
		'{{strong}}%(theme)s{{/strong}} does not fully support editing all parts of your site, such as headers and footers.',
		{
			components: { strong: <strong /> },
			args: { theme: themeName },
		}
	);
	const second = translate(
		'If you activate this theme, you will still have limited site appearance control using the legacy Customizer tool.'
	);
	return (
		<Dialog { ...props } buttons={ buttons }>
			<div style={ { maxWidth: '33em' } }>
				<h1>{ translate( 'Warning' ) }</h1>
				<p>{ first }</p>
				<p>{ second }</p>
			</div>
		</Dialog>
	);
}
