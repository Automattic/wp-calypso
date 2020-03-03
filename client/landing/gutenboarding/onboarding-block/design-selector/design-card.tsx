/**
 * External dependencies
 */
import React, { FunctionComponent, MouseEventHandler, CSSProperties } from 'react';
import { addQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { Card, CardMedia } from '@wordpress/components';

const gridWidth = 960;
const srcSet = ( src: string, widths: number[] ) =>
	widths.map( width => addQueryArgs( src, { w: width } ) + ` ${ width }w` ).join( ', ' );

interface Props {
	design: import('@automattic/data-stores').VerticalsTemplates.Template;
	onClick: MouseEventHandler< HTMLButtonElement >;
	style?: CSSProperties;
	dialogId: string;
	tabIndex: number;
}
const DesignCard: FunctionComponent< Props > = ( {
	design,
	dialogId,
	onClick,
	style,
	tabIndex = 0,
} ) => {
	const { __: NO__ } = useI18n();
	return (
		<Card
			as="button"
			className="design-selector__design-option"
			isElevated
			onClick={ onClick }
			style={ style }
			aria-haspopup="dialog"
			aria-controls={ dialogId }
			tabIndex={ tabIndex }
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
};

export default DesignCard;
