/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { FormToggle, withInstanceId } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/element';

function PostPingbacks( { pingStatus = 'open', instanceId, ...props } ) {
	const onTogglePingback = () => props.editPost( { ping_status: pingStatus === 'open' ? 'closed' : 'open' } );

	const pingbacksToggleId = 'allow-pingbacks-toggle-' + instanceId;

	return [
		<label key="label" htmlFor={ pingbacksToggleId }>{ __( 'Allow Pingbacks & Trackbacks' ) }</label>,
		<FormToggle
			key="toggle"
			checked={ pingStatus === 'open' }
			onChange={ onTogglePingback }
			id={ pingbacksToggleId }
		/>,
	];
}

export default compose( [
	withSelect( ( select ) => {
		return {
			pingStatus: select( 'core/editor' ).getEditedPostAttribute( 'ping_status' ),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		editPost: dispatch( 'core/editor' ).editPost,
	} ) ),
	withInstanceId,
] )( PostPingbacks );
