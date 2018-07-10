/**
 * External dependencies
 */
import tinycolor from 'tinycolor2';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';

function ContrastChecker( { backgroundColor, textColor, isLargeText, fallbackBackgroundColor, fallbackTextColor } ) {
	if ( ! ( backgroundColor || fallbackBackgroundColor ) || ! ( textColor || fallbackTextColor ) ) {
		return null;
	}
	const tinyBackgroundColor = tinycolor( backgroundColor || fallbackBackgroundColor );
	const tinyTextColor = tinycolor( textColor || fallbackTextColor );
	const hasTransparency = tinyBackgroundColor.getAlpha() !== 1 || tinyTextColor.getAlpha() !== 1;

	if ( hasTransparency || tinycolor.isReadable(
		tinyBackgroundColor,
		tinyTextColor,
		{ level: 'AA', size: ( isLargeText ? 'large' : 'small' ) }
	) ) {
		return null;
	}
	const msg = tinyBackgroundColor.getBrightness() < tinyTextColor.getBrightness() ?
		__( 'This color combination may be hard for people to read. Try using a darker background color and/or a brighter text color.' ) :
		__( 'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.' );
	return (
		<div className="editor-contrast-checker">
			<Notice status="warning" isDismissible={ false }>
				{ msg }
			</Notice>
		</div>
	);
}

export default ContrastChecker;
