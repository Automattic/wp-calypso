/**
 * External dependencies
 */
import React, { FunctionComponent, MouseEventHandler, CSSProperties } from 'react';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '../../components/card';
import { CardMedia } from '../../components/card/media';

const gridWidth = 960;
const srcSet = ( src: string, widths: number[] ) =>
	widths.map( width => addQueryArgs( src, { w: width } ) + ` ${ width }w` ).join( ', ' );

interface Props {
	isSelected?: boolean;
	design: import('@automattic/data-stores').VerticalsTemplates.Template;
	onClick: MouseEventHandler< HTMLDivElement >;
	style?: CSSProperties;
}
const DeisgnCard: FunctionComponent< Props > = ( { design, onClick, isSelected, style } ) => (
	<Card
		className={ classnames( 'design-selector__design-option', { 'is-selected': isSelected } ) }
		isElevated
		onClick={ onClick }
		style={ style }
	>
		<CardMedia>
			<img
				width={ 480 }
				height={ 360 }
				alt={ design.title }
				src={ removeQueryArgs( design.preview, 'w' ) }
				srcSet={ srcSet( design.preview, [ gridWidth / 2, gridWidth / 4 ] ) }
			/>
		</CardMedia>
	</Card>
);

export default DeisgnCard;
