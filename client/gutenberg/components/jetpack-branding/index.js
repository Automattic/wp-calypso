/** @format */

/**
 * External dependencies
 */
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';
import './style.scss';

const JetpackBranding = () => (
	<InspectorControls>
		<div className="jetpack-branding">
			<hr />
			<JetpackLogo full size="40" />
		</div>
	</InspectorControls>
);

export default JetpackBranding;
