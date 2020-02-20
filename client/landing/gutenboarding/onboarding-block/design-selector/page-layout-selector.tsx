/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { Card, CardFooter, CardMedia, Icon } from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';

type Template = import('@automattic/data-stores').VerticalsTemplates.Template;

interface Props {
	templates: Template[];
}

const PageLayoutSelector: FunctionComponent< Props > = ( { templates } ) => {
	const { __: NO__ } = useI18n();
	const { pageLayouts } = useSelect( select => select( ONBOARD_STORE ).getState() );
	const { togglePageLayout } = useDispatch( ONBOARD_STORE );

	return (
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
								'is-selected': pageLayouts.includes( template.slug ),
							} ) }
							onClick={ () => togglePageLayout( template ) }
							key={ template.slug }
						>
							<CardMedia className="page-layout-selector__card-media" as="span">
								<img
									alt={ template.description }
									src={ removeQueryArgs( template.preview, 'w' ) }
								/>
							</CardMedia>
							<CardFooter className="page-layout-selector__card-footer" as="span">
								{ template.title }
							</CardFooter>
							<span className="page-layout-selector__selected-indicator">
								<Icon icon="yes" size={ 24 } />
							</span>
						</Card>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default PageLayoutSelector;
