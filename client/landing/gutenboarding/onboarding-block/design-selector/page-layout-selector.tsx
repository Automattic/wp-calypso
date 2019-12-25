/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { __ as NO__, sprintf } from '@wordpress/i18n';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Card from '../../components/card';
import CardMedia from '../../components/card/media';
import { removeQueryArgs } from '@wordpress/url';
import { Icon } from '@wordpress/components';

type Template = import('@automattic/data-stores').VerticalsTemplates.Template;

interface Props {
	selectedDesign: Template | undefined;
	selectedLayouts: Set< Template[ 'slug' ] >;
	selectLayout: ( t: Template ) => void;
	templates: Template[];
}

const PageLayoutSelector: FunctionComponent< Props > = ( {
	selectedDesign,
	selectedLayouts,
	selectLayout,
	templates,
} ) => (
	<div className="page-layout-selector">
		<div className="page-layout-selector__content">
			<h1 className="page-layout-selector__title">
				{ selectedDesign
					? sprintf( NO__( 'Select the pages you want to use with %s:' ), selectedDesign.title )
					: null }
			</h1>
			<div className="page-layout-selector__grid">
				{ templates.map( template => (
					<Card
						className={ classnames( 'page-layout-selector__item', {
							'is-selected': selectedLayouts.has( template.slug ),
						} ) }
						onClick={ () => selectLayout( template ) }
						key={ template.slug }
					>
						<div className="page-layout-selector__selected-indicator">
							<Icon icon="yes" size={ 24 } />
						</div>
						<CardMedia>
							<img alt={ template.description } src={ removeQueryArgs( template.preview, 'w' ) } />
						</CardMedia>
					</Card>
				) ) }
			</div>
		</div>
	</div>
);

export default PageLayoutSelector;
