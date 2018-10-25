/** @format */
/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

export default ( { attributes: { url, view }, className } ) => (
	<div className={ className }>
		<iframe
			title={ __( 'VR Image' ) }
			allowFullScreen="true"
			frameBorder="0"
			width="100%"
			height="300"
			src={ addQueryArgs( 'https://vr.me.sh/view/', { url, view } ) }
		/>
	</div>
);
