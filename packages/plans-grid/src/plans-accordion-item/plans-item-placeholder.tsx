/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { NextButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */
import PlansFeatureListPlaceholder from '../plans-feature-list/plans-feature-list-placeholder';

/**
 * Style dependencies
 */
import './style.scss';

const ChevronDown = (
	<svg width="8" viewBox="0 0 8 4">
		<path d="M0 0 L8 0 L4 4 L0 0" fill="currentColor" />
	</svg>
);
export interface Props {
	isOpen?: boolean;
	isPrimary?: boolean;
}

const PlanItemPlaceholder: React.FunctionComponent< Props > = ( { isOpen, isPrimary } ) => {
	return (
		<div
			className={ classNames( 'plans-accordion-item', {
				'is-open': isOpen,
				'is-primary': isPrimary,
			} ) }
		>
			<div className="plans-accordion-item__viewport">
				<div className="plans-accordion-item__details">
					<div tabIndex={ 0 } role="button" className="plans-accordion-item__header">
						<div className="plans-accordion-item__heading">
							<div className="plans-accordion-item__name">
								<span className="plans-accordion-item__placeholder">{ '' }</span>
							</div>
							<div className="plans-accordion-item__description">
								<span className="plans-accordion-item__placeholder plans-accordion-item__placeholder--wide">
									{ '' }
								</span>
							</div>
						</div>
						<div className="plans-accordion-item__price">
							<div className="plans-accordion-item__price-amount">
								<span className="plans-accordion-item__placeholder">{ '' }</span>
							</div>
							<div className="plans-accordion-item__price-note">
								<span className="plans-accordion-item__placeholder plans-accordion-item__placeholder--wide">
									{ '' }
								</span>
							</div>
						</div>
						<div className="plans-accordion-item__disabled-label">{ '' }</div>
						{ ! isOpen && (
							<div className="plans-accordion-item__dropdown-chevron">{ ChevronDown }</div>
						) }
					</div>
					<div className="plans-accordion-item__actions" hidden={ ! isOpen }>
						{ <NextButton disabled>{ <span>{ '' }</span> }</NextButton> }
					</div>
					{ <PlansFeatureListPlaceholder isOpen={ isOpen } multiColumn /> }
				</div>
			</div>
		</div>
	);
};

export default PlanItemPlaceholder;
