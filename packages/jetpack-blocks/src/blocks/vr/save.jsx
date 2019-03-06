/**
 * External dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { __ } from '../../utils/i18n';

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
