/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import './style.scss';

export function PatternTitleContainer( { title } ) {
	const [ showTooltip, setShowTooltip ] = React.useState( false );

	return (
		<div
			onMouseEnter={ () => setShowTooltip( true ) }
			onMouseLeave={ () => setShowTooltip( false ) }
		>
			{ showTooltip ? <div>Hello, there!</div> : null }
			<span> { title } </span>
			<span> { __( 'Premium', 'full-site-editing' ) } </span>
		</div>
	);
}

export const PremiumBlockPatterns = () => {
	const { __experimentalBlockPatterns } = useSelect(
		( select ) => select( 'core/block-editor' ).getSettings() as any
	);
	const { updateSettings } = useDispatch( 'core/block-editor' );

	if ( __experimentalBlockPatterns ) {
		let shouldUpdateBlockPatterns = false;
		const updatedPatterns: any = [];

		__experimentalBlockPatterns.forEach( ( originalPattern: any ) => {
			const pattern = { ...originalPattern };

			if ( typeof pattern.title === 'string' ) {
				const originalTitle = pattern.title;

				pattern.title = <PatternTitleContainer title={ originalTitle } />;
				pattern.title.toString = () => originalTitle;

				shouldUpdateBlockPatterns = true;
			}
			updatedPatterns.push( pattern );
		} );

		if ( shouldUpdateBlockPatterns ) {
			updateSettings( {
				__experimentalBlockPatterns: updatedPatterns,
			} as any );
		}
	}

	return null;
};

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-wpcom-premium-block-patterns', {
	render: () => {
		return <PremiumBlockPatterns />;
	},
} );
