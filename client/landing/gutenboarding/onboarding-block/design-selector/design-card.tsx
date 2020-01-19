/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import React, { FunctionComponent, MouseEventHandler, CSSProperties } from 'react';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { Card } from '../../components/card';
import { CardMedia } from '../../components/card/media';

const gridWidth = 960;
const srcSet = ( src: string, widths: number[] ) =>
	widths.map( width => addQueryArgs( src, { w: width } ) + ` ${ width }w` ).join( ', ' );

interface Props {
	design: import('@automattic/data-stores').VerticalsTemplates.Template;
	onClick: MouseEventHandler< HTMLDivElement >;
	style?: CSSProperties;
	dialogId: string;
}
const DesignCard: FunctionComponent< Props > = ( { design, dialogId, onClick, style } ) => (
	<Card
		as="button"
		className="design-selector__design-option"
		isElevated
		onClick={ onClick }
		style={ style }
		aria-haspopup="dialog"
		aria-controls={ dialogId }
	>
		<CardMedia as="span">
			<img
				width={ 480 }
				height={ 360 }
				alt={ design.title }
				src={ removeQueryArgs( design.preview, 'w' ) }
				srcSet={ srcSet( design.preview, [ gridWidth / 2, gridWidth / 4 ] ) }
			/>
			<span className="design-selector__option-overlay">
				<span className="design-selector__option-overlay-text">
					{ NO__( 'Select this design' ) }
				</span>
			</span>
		</CardMedia>
	</Card>
);

export default DesignCard;
