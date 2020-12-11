/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { __ } from '@wordpress/i18n';
import { NextButton } from '@automattic/onboarding';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import PlansFeatureList from '../plans-feature-list';

/**
 * Style dependencies
 */
import './style.scss';

const ChevronDown = (
	<svg width="8" viewBox="0 0 8 4">
		<path d="M0 0 L8 0 L4 4 L0 0" fill="currentColor" />
	</svg>
);

const SPACE_BAR_KEYCODE = 32;

export interface Props {
	slug: string;
	name: string;
	description: string;
	price: string;
	features: Array< string >;
	domain?: DomainSuggestions.DomainSuggestion;
	badge?: string;
	isFree?: boolean;
	isOpen?: boolean;
	isPrimary?: boolean;
	isSelected?: boolean;
	onSelect: ( slug: string ) => void;
	onPickDomainClick?: () => void;
	onToggle?: ( slug: string, isOpen: boolean ) => void;
	disabledLabel?: string;
}

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	description,
	price,
	features,
	domain,
	badge,
	isFree = false,
	isOpen = false,
	isPrimary = false,
	onSelect,
	onPickDomainClick,
	onToggle,
	disabledLabel,
} ) => {
	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0\u00A0';

	const handleToggle = () => {
		! disabledLabel && onToggle?.( slug, ! isOpen );
	};

	return (
		<div
			className={ classNames( 'plans-accordion-item', {
				'is-open': isOpen,
				'is-primary': isPrimary,
				'has-badge': !! badge,
				'is-disabled': !! disabledLabel,
			} ) }
		>
			{ badge && (
				<div className="plans-accordion-item__badge">
					<span>{ badge }</span>
				</div>
			) }
			<div className="plans-accordion-item__viewport">
				<div className="plans-accordion-item__details">
					<div
						tabIndex={ 0 }
						role="button"
						onClick={ handleToggle }
						onKeyDown={ ( e ) => e.keyCode === SPACE_BAR_KEYCODE && handleToggle() }
						className="plans-accordion-item__header"
					>
						<div className="plans-accordion-item__heading">
							<div className="plans-accordion-item__name">{ name }</div>
							<div className="plans-accordion-item__description">{ description }</div>
						</div>
						<div className="plans-accordion-item__price">
							<div
								className={ classNames( 'plans-accordion-item__price-amount', {
									'is-loading': ! price,
								} ) }
							>
								{ price || nbsp }
								{ price && (
									<span>
										{
											// translators: /mo is short for "per-month"
											__( '/mo', __i18n_text_domain__ )
										}
									</span>
								) }
							</div>
							<div className="plans-accordion-item__price-note">
								{ isFree
									? __( 'free forever', __i18n_text_domain__ )
									: __( 'billed annually', __i18n_text_domain__ ) }
							</div>
						</div>
						<div className="plans-accordion-item__disabled-label">{ disabledLabel }</div>
						{ ! isOpen && (
							<div className="plans-accordion-item__dropdown-chevron">{ ChevronDown }</div>
						) }
					</div>
					<div className="plans-accordion-item__actions" hidden={ ! isOpen }>
						<NextButton
							data-e2e-button={ isFree ? 'freePlan' : 'paidPlan' }
							onClick={ () => {
								onSelect( slug );
							} }
						>
							{ __( 'Select', __i18n_text_domain__ ) }
						</NextButton>
					</div>
					<PlansFeatureList
						features={ features }
						domain={ domain }
						isFree={ isFree }
						isOpen={ isOpen }
						onPickDomain={ onPickDomainClick }
						multiColumn
					/>
				</div>
			</div>
		</div>
	);
};

export default PlanItem;
