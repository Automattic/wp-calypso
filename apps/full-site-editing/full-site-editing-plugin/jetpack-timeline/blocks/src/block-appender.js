/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';

/**
 * WordPress dependencies
 */

export const BlockAppender = ( props ) => {
	const { onClick } = props;
	return (
		<button
			className="block-editor-inserter__toggle timeline-item-appender"
			type="button"
			style={ { zIndex: 99999 } }
			onClick={ onClick }
		>
			<svg
				aria-hidden="true"
				role="img"
				focusable="false"
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 20 20"
			>
				<path d="M10 1c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7zm1-11H9v3H6v2h3v3h2v-3h3V9h-3V6z"></path>
			</svg>{ ' ' }
			{ __( 'Add New Entry', 'full-site-editing' ) }
		</button>
	);
};
