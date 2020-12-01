/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';

/**
 * Internal dependencies
 */
import PatternPopover from './components/pattern-popover';
import './style.scss';

interface PatternTitleProps {
	title: string;
	description?: string;
}

interface ExperimentalBlockPattern {
	categories: string[];
	content: string;
	description: string;
	isPremium: boolean;
	name: string;
	title: string;
	viewportWidth: int;
}

export const PatternTitleContainer: React.FunctionComponent< PatternTitleProps > = ( {
	title,
	description,
} ) => {
	const [ showPopover, setShowPopover ] = React.useState( false );
	const [ isFocussed, setIsFocussed ] = React.useState( false );
	const ref = React.useRef();

	React.useEffect( () => {
		// The direct parent is the block-editor-block-patterns-list__item-title
		// So our grandparent is the actual button that will receive focus, see:
		// https://github.com/WordPress/gutenberg/blob/master/packages/block-editor/src/components/block-patterns-list/index.js#L15
		const updateFocus = () =>
			setIsFocussed(
				document.hasFocus() && ref.current?.parentElement?.parentElement === document.activeElement
			);

		updateFocus();

		document.addEventListener( 'focusin', updateFocus );
		return () => document.removeEventListener( 'focusin', updateFocus );
	}, [] );

	return (
		<div>
			<div
				className="pattern-title-container"
				onMouseEnter={ () => setShowPopover( true ) }
				onMouseLeave={ () => setShowPopover( false ) }
			></div>
			{ showPopover || isFocussed ? (
				<PatternPopover title={ title } description={ description }></PatternPopover>
			) : null }
			<span className="premium-pattern-title"> { title } </span>
		</div>
	);
};

export const PremiumBlockPatterns: React.FunctionComponent = () => {
	const { __experimentalBlockPatterns } = useSelect( ( select ) =>
		select( 'core/block-editor' ).getSettings()
	);
	const { updateSettings } = useDispatch( 'core/block-editor' );

	if ( __experimentalBlockPatterns ) {
		let shouldUpdateBlockPatterns = false;
		const updatedPatterns: Array = [];

		__experimentalBlockPatterns.forEach( ( originalPattern: ExperimentalBlockPattern ) => {
			const pattern = { ...originalPattern };

			if ( pattern.isPremium && typeof pattern.title === 'string' ) {
				const originalTitle = pattern.title;
				const description = pattern.description;

				pattern.title = (
					<PatternTitleContainer title={ originalTitle } description={ description } />
				);
				// Add simple premium badging for screen readers
				pattern.title.toString = () =>
					sprintf(
						// translators: %s is the title of a block pattern e.g. "Two columns (Premium)". "Premium" is synonymous with "paid"
						__( '%s (Premium)', 'full-site-editing' ),
						originalTitle
					);

				shouldUpdateBlockPatterns = true;
			}
			updatedPatterns.push( pattern );
		} );

		if ( shouldUpdateBlockPatterns ) {
			updateSettings( {
				__experimentalBlockPatterns: updatedPatterns,
			} );
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
