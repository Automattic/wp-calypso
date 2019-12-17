/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card } from '../../components/card';
import { CardMedia } from '../../components/card/media';
import { SiteVertical } from '../../stores/onboard/types';

import './style.scss';

const gridWidth = 960;

const srcSet = ( src: string, widths: number[] ) =>
	widths.map( width => addQueryArgs( src, { w: width } ) + ` ${ width }w` ).join( ', ' );

export default () => {
	const siteVertical = useSelect(
		select => select( 'automattic/onboard' ).getState().siteVertical as SiteVertical
	);

	const templates =
		useSelect( select =>
			select( 'automattic/verticals/templates' ).getTemplates( siteVertical.id )
		) ?? [];

	const homepageTemplates = templates.filter( template => template.category === 'home' );

	const [ selectedDesign, setSelectedDesign ] = useState< string | undefined >();
	return (
		<div className="design-selector">
			<h1 className="design-selector__title">
				{ NO__( 'Choose a starting design for your site' ) }
			</h1>
			<h2 className="design-selector__subtitle">
				{ NO__( "You'll be able to customize your new site in hundreds of ways." ) }
			</h2>
			<div className="design-selector__grid">
				{ homepageTemplates.map( template => (
					<Card
						className={ classnames( 'design-selector__design-option', {
							'is-selected': template.slug === selectedDesign,
						} ) }
						key={ template.slug }
						isElevated
						onClick={ () => setSelectedDesign( template.slug ) }
					>
						<CardMedia>
							<img
								alt={ template.title }
								src={ template.preview }
								srcSet={ srcSet( template.preview, [ gridWidth / 2, gridWidth / 4 ] ) }
							/>
						</CardMedia>
					</Card>
				) ) }
			</div>
		</div>
	);
};
