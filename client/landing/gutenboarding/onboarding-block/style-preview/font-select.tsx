/**
 * External dependencies
 */
import * as React from 'react';
import { Button } from '@wordpress/components';
import classnames from 'classnames';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { fontPairings } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import { useI18n } from '@automattic/react-i18n';

const FontSelect: React.FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { selectedFonts } = useSelect( select => select( STORE_KEY ).getState() );
	const { setFonts } = useDispatch( STORE_KEY );
	return (
		<div className="style-preview__font-options">
			<Button
				className={ classnames( 'style-preview__font-option', { 'is-selected': ! selectedFonts } ) }
				onClick={ () => setFonts( undefined ) }
			>
				{ NO__( 'Theme default' ) }
			</Button>
			{ fontPairings.map( fontPair => {
				const isSelected = fontPair === selectedFonts;
				const {
					headings: { title: fontHeadings, fontFamily: fontFamilyHeadings },
					base: { title: fontBase, fontFamily: fontFamilyBase },
				} = fontPair;

				return (
					<Button
						className={ classnames( 'style-preview__font-option', { 'is-selected': isSelected } ) }
						onClick={ () => setFonts( fontPair ) }
						key={ fontHeadings + fontBase }
					>
						<span style={ { fontFamily: fontFamilyHeadings, fontWeight: 700 } }>
							{ fontHeadings }
						</span>
						&nbsp;/&nbsp;
						<span style={ { fontFamily: fontFamilyBase } }>{ fontBase }</span>
					</Button>
				);
			} ) }
		</div>
	);
};

export default FontSelect;
