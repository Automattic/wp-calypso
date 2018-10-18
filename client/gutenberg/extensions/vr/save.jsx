/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export default ( { attributes, className } ) => (
	<div className={ className }>
		<iframe
			title={ __( 'VR Image', 'jetpack' ) }
			allowFullScreen="true"
			frameBorder="0"
			width="100%"
			height="300"
			src={
				'https://vr.me.sh/view/?view=' +
				encodeURIComponent( attributes.view ) +
				'&url=' +
				encodeURIComponent( attributes.url )
			}
		/>
	</div>
);
