/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { __ as NO__ } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { Card, CardFooter, CardMedia, Icon } from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';

type Template = import('@automattic/data-stores').VerticalsTemplates.Template;

interface Props {
	selectedDesign: Template | undefined;
	selectedLayouts: Set< Template[ 'slug' ] >;
	selectLayout: ( t: Template ) => void;
	templates: Template[];
}

const PageLayoutSelector: FunctionComponent< Props > = ( {
	selectedLayouts,
	selectLayout,
	templates,
} ) => (
	<div className="page-layout-selector">
		<div className="page-layout-selector__content">
			<h1
				/* ID for aria-labelledby */ id="page-layout-selector__title"
				className="page-layout-selector__title"
			>
				{ NO__( "Select the pages you'd like to include:" ) }
			</h1>
			<div className="page-layout-selector__grid">
				{ templates.map( template => (
					<Card
						as="button"
						className={ classnames( 'page-layout-selector__item', {
							'is-selected': selectedLayouts.has( template.slug ),
						} ) }
						onClick={ () => selectLayout( template ) }
						key={ template.slug }
					>
						<span className="page-layout-selector__selected-indicator">
							<Icon icon="yes" size={ 24 } />
						</span>
						<CardMedia className="page-layout-selector__card-media" as="span">
							<img alt={ template.description } src={ removeQueryArgs( template.preview, 'w' ) } />
						</CardMedia>
						<CardFooter className="page-layout-selector__card-footer" as="span">
							{ template.title }
						</CardFooter>
					</Card>
				) ) }
			</div>
		</div>
	</div>
);

export default PageLayoutSelector;
