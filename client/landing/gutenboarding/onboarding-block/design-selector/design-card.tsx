/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import React, { FunctionComponent, MouseEventHandler, CSSProperties, useState } from 'react';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { Card, CardMedia } from '@wordpress/components';
import DynamicPreview from './dynamic-preview';

const gridWidth = 960;
const srcSet = ( src: string, widths: number[] ) =>
	widths.map( width => addQueryArgs( src, { w: width } ) + ` ${ width }w` ).join( ', ' );

interface Props {
	design: import('@automattic/data-stores').VerticalsTemplates.Template;
	onClick: MouseEventHandler< HTMLButtonElement >;
	style?: CSSProperties;
	dialogId: string;
}
const DesignCard: FunctionComponent< Props > = ( { design, dialogId, onClick, style } ) => {
	const [ preview, setPreview ] = useState< boolean >( false );
	const startPreview = () => setPreview( true );
	const endPreview = () => setPreview( false );

	return (
		<Card
			as="button"
			className="design-selector__design-option"
			isElevated
			onClick={ onClick }
			style={ style }
			aria-haspopup="dialog"
			aria-controls={ dialogId }
			onMouseEnter={ startPreview }
			onMouseLeave={ endPreview }
			onFocus={ startPreview }
			onBlur={ endPreview }
		>
			<CardMedia as="span">
				{ preview ? (
					<DynamicPreview design={ design } />
				) : (
					<img
						width={ 480 }
						height={ 360 }
						alt={ design.title }
						src={ removeQueryArgs( design.preview, 'w' ) }
						srcSet={ srcSet( design.preview, [ gridWidth / 2, gridWidth / 4 ] ) }
					/>
				) }
				<span className="design-selector__option-overlay">
					<span className="design-selector__option-overlay-text">
						{ NO__( 'Select this design' ) }
					</span>
				</span>
			</CardMedia>
		</Card>
	);
};

export default DesignCard;
