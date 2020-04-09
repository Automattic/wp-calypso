/**
 * External dependencies
 */
import * as React from 'react';
import { SVG, Path, Rect, Button } from '@wordpress/components';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import * as T from './types';
import { useI18n } from '@automattic/react-i18n';

// TODO FIXME: React elements are a poor choice for static svgs.
// Refactor, external svg with use?

interface Props {
	onSelect: ( selection: T.Viewport ) => void;
	selected: T.Viewport;
}
const ViewportSelect: React.FunctionComponent< Props > = ( { onSelect, selected } ) => {
	const { __ } = useI18n();
	return (
		<div className="style-preview__viewport-select">
			<ViewportButton
				aria-label={ __( 'Select desktop preview' ) }
				onClick={ () => onSelect( 'desktop' ) }
				isSelected={ selected === 'desktop' }
			>
				<SVG width="55" height="55" viewBox="0 0 55 55">
					<Path
						d="M10.4258 15.75C10.4258 15.0596 10.9854 14.5 11.6758 14.5H43.3239C44.0143 14.5 44.5739 15.0596 44.5739 15.75V38.463H10.4258V15.75Z"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<Path
						d="M4.58301 38.667C4.58301 37.5624 5.47844 36.667 6.58301 36.667H48.4163C49.5209 36.667 50.4163 37.5624 50.4163 38.667V40.1045H4.58301V38.667Z"
						fill="currentColor"
					/>
				</SVG>
			</ViewportButton>
			<ViewportButton
				aria-label={ __( 'Select tablet preview' ) }
				onClick={ () => onSelect( 'tablet' ) }
				isSelected={ selected === 'tablet' }
			>
				<SVG width="48" height="48" viewBox="0 0 48 48">
					<Rect
						x="10.75"
						y="8.75"
						width="26.5"
						height="30.5"
						rx="1.25"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<Rect x="20" y="32" width="8" height="3" fill="currentColor" />
				</SVG>
			</ViewportButton>
			<ViewportButton
				aria-label={ __( 'Select mobile preview' ) }
				onClick={ () => onSelect( 'mobile' ) }
				isSelected={ selected === 'mobile' }
			>
				<SVG width="40" height="40" viewBox="0 0 40 40">
					<Rect
						x="12.417"
						y="7.41699"
						width="16"
						height="25.1667"
						rx="1.25"
						stroke="currentColor"
						strokeWidth="1.5"
					/>
					<Rect x="18.333" y="26.667" width="5" height="2.5" fill="currentColor" />
				</SVG>
			</ViewportButton>
		</div>
	);
};

interface ButtonProps {
	onClick: () => void;
	isSelected?: boolean;
}
const ViewportButton: React.FunctionComponent< ButtonProps > = ( {
	children,
	onClick,
	isSelected,
	...rest
} ) => (
	<Button
		className={ classnames( 'style-preview__viewport-select-button', {
			'is-selected': isSelected,
		} ) }
		onClick={ onClick }
		{ ...rest }
	>
		{ children }
	</Button>
);

export default ViewportSelect;
