/* eslint-disable wpcalypso/jsx-classname-namespace */
// disabled CSS class rule due to existing code already
// that users the non-conformant classnames

import { __ } from '@wordpress/i18n';

export const BlockAppender = ( props ) => {
	const { onClick } = props;
	return (
		<button
			className="block-editor-inserter__toggle timeline-item-appender components-button"
			type="button"
			style={ { zIndex: 99999 } }
			onClick={ onClick }
		>
			<svg
				width="24"
				height="24"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				role="img"
				aria-hidden="true"
				focusable="false"
			>
				<path d="M18 11.2h-5.2V6h-1.6v5.2H6v1.6h5.2V18h1.6v-5.2H18z"></path>
			</svg>{ ' ' }
			{ __( 'Add entry', 'full-site-editing' ) }
		</button>
	);
};
