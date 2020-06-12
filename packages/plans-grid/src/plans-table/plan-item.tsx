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

const TickIcon = <Icon icon={ check } size={ 16 } />;

export interface Props {
	slug: string;
	name: string;
	price: string;
	features: Array< string >;
	domainName?: string;
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
	domainName,
	features,
	onSelect,
} ) => {
	const { __ } = useI18n();

	const hasDomain = !! domainName;

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
					<div className="plan-item__domain-summary">
						{ isFree ? __( 'Free WordPress.com subdomain' ) : __( 'Free domain for 1 year' ) }
					</div>
					{ hasDomain && (
						<div className="plan-item__domain-name">
							{ /*
						<Button
							className={ classNames( 'plan-item__domain-picker-button', {
								'has-domain': hasDomain,
							} ) }
							isLink
						>
							<span>{ hasDomain ? domainName : __( 'Choose domain' ) }</span>
							<Icon icon="arrow-down-alt2" size={ 14 }></Icon>
						</Button>
						*/ }
							{ domainName }
						</div>
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
