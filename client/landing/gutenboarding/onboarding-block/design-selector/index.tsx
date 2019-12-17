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
						<img alt={ template.title } src={ template.preview } />
					</CardMedia>
				</Card>
			) ) }
		</div>
	);
};
