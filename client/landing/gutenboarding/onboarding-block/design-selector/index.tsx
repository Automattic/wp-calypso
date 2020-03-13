/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import classnames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { useHistory } from 'react-router-dom';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import designs from './available-designs.json';
import { usePath, Step } from '../../path';
import { isEnabled } from '../../../../config';
import './style.scss';
import { SubTitle, Title } from 'landing/gutenboarding/components/titles';

const DesignSelector: FunctionComponent = () => {
	const { __: NO__ } = useI18n();
	const { push } = useHistory();
	const makePath = usePath();
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
				<Title>{ NO__( 'Choose a starting design' ) }</Title>
				<SubTitle>
					{ NO__(
						'Get started with one of our top website layouts. You can always change it later'
					) }
				</SubTitle>
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
								if ( isEnabled( 'gutenboarding/style-preview' ) ) {
									push( makePath( Step.Style ) );
								}
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
