/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import designs from './available-designs.json';

import './style.scss';
interface Props {
	showPageSelector?: true;
}

const DesignSelector: FunctionComponent< Props > = () => {
	const { __: NO__ } = useI18n();
	const { selectedDesign, siteVertical } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	return (
		<div
			className="design-selector gutenboarding-color-coded"
			data-vertical={ siteVertical?.label }
		>
			<div className="design-selector__header">
				<h1 className="design-selector__title">{ NO__( 'Choose a starting design' ) }</h1>
				<h2 className="design-selector__subtitle">
					{ NO__(
						'Get started with one of our top website layouts. You can always change it later'
					) }
				</h2>
			</div>
			<div className="design-selector__design-grid">
				<div className="design-selector__grid">
					{ designs.featured.map( design => (
						<button
							key={ design.slug }
							className={ classnames(
								'design-selector__design-option',
								design.slug === selectedDesign?.slug ? 'selected' : null
							) }
							onClick={ () => {
								setSelectedDesign( design );
							} }
						>
							<div className="design-selector__image-frame">
								<img alt={ design.title } src={ design.src } srcSet={ design.srcset } />
							</div>
							<span className="design-selector__option-overlay">
								<span className="design-selector__option-name">{ design.title }</span>
							</span>
						</button>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default DesignSelector;
