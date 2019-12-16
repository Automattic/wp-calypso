/**
 * External dependencies
 */
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
			{ homepageTemplates.map( t => (
				<Card
					className={ classnames( 'design-selector__design-option', {
						'is-selected': t.slug === selectedDesign,
					} ) }
					key={ t.slug }
					isElevated
					onClick={ () => setSelectedDesign( t.slug ) }
				>
					<CardMedia>
						<img alt={ t.title } src={ t.preview } />
					</CardMedia>
				</Card>
			) ) }
		</div>
	);
};
