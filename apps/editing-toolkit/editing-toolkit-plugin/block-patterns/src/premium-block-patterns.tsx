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
import PatternPopover from './components/pattern-popover';
import PatternBadge from './components/pattern-badge';
import './style.scss';

interface PatternTitleProps {
	title: string;
}

export const PatternTitleContainer: React.FunctionComponent< PatternTitleProps > = ( {
	title,
} ) => {
	const [ showPopover, setShowPopover ] = React.useState( false );

	return (
		<div>
			<div
				className="pattern-title-container"
				onMouseEnter={ () => setShowPopover( true ) }
				onMouseLeave={ () => setShowPopover( false ) }
			></div>
			{ showPopover ? <PatternPopover title={ title }></PatternPopover> : null }
			<span> { title } </span>
			<div>
				<PatternBadge> { __( 'Premium', 'full-site-editing' ) } </PatternBadge>
			</div>
		</div>
	);
};

export const PremiumBlockPatterns: React.FunctionComponent = () => {
	const { __experimentalBlockPatterns } = useSelect(
		( select ) => select( 'core/block-editor' ).getSettings() as any
	);
	const { updateSettings } = useDispatch( 'core/block-editor' );

	if ( __experimentalBlockPatterns ) {
		let shouldUpdateBlockPatterns = false;
		const updatedPatterns: any = [];

		__experimentalBlockPatterns.forEach( ( originalPattern: any ) => {
			const pattern = { ...originalPattern };

			if ( pattern.isPremium && typeof pattern.title === 'string' ) {
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
