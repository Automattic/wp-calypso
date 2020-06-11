/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Badge from '../badge';
import type { DomainSuggestions } from '@automattic/data-stores/dist/types';

const TickIcon = <Icon icon={ check } size={ 16 } />;

export interface Props {
	slug: string;
	name: string;
	price: string;
	features: Array< string >;
	domain?: DomainSuggestions.DomainSuggestion;
	isPopular?: boolean;
	isFree?: boolean;
	isSelected?: boolean;
	onSelect: ( slug: string ) => void;
}

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	price,
	isPopular = false,
	isSelected = false,
	isFree = false,
	domain,
	features,
	onSelect,
} ) => {
	const { __ } = useI18n();

	const hasDomain = !! domain;

	const domainName = domain?.domain_name;

	// show a nbps in price while loading to prevent a janky UI
	const nbsp = '\u00A0';

	return (
		<div className="plan-item">
			<div className="plan-item__viewport">
				<div className="plan-item__heading">
					<div className="plan-item__name">{ name }</div>
					{ isPopular && <Badge className="plan-item__badge">{ __( 'Popular' ) }</Badge> }
				</div>
				<div className="plan-item__price">
					<div className={ classNames( 'plan-item__price-amount', { 'is-loading': ! price } ) }>
						{ price || nbsp }
					</div>
					<div className="plan-item__price-note">
						{ isFree ? __( 'free forever' ) : __( 'per month, billed yearly' ) }
					</div>
				</div>
				<div className="plan-item__actions">
					<Button
						className={ classNames( 'plan-item__select-button', { 'is-selected': isSelected } ) }
						onClick={ () => {
							onSelect( slug );
						} }
						isLarge
					>
						{ isSelected ? (
							<>
								{ TickIcon }
								<span>{ __( 'Selected' ) }</span>
							</>
						) : (
							<span>{ __( 'Select' ) }</span>
						) }
					</Button>
				</div>
				<div className="plan-item__domain">
					<div className={ classNames( 'plan-item__domain-summary', { 'is-paid': ! isFree } ) }>
						{ isFree ? __( 'No custom domain' ) : __( 'Free domain for 1 year' ) }
					</div>
					{ hasDomain && ! isFree && ! domain?.is_free && (
						<div className={ classNames( 'plan-item__domain-name', { 'is-paid': ! isFree } ) }>
							{ domainName }
						</div>
					) }
					{ hasDomain && isFree && (
						<div className="plan-item__domain-name">{ __( 'Ads included on site' ) }</div>
					) }
				</div>
				<div className="plan-item__features">
					<ul className="plan-item__feature-item-group">
						{ features.map( ( feature, i ) => (
							<li key={ i } className="plan-item__feature-item">
								{ feature }
							</li>
						) ) }
					</ul>
				</div>
			</div>
		</div>
	);
};

export default PlanItem;
