/**
 * External dependencies
 */
import React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button, Icon } from '@wordpress/components';
import classNames from 'classnames';

const TickIcon = (
	<Icon
		icon={ () => (
			<svg
				width="16"
				height="12"
				viewBox="0 0 16 12"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M5.4987 9.50033L1.9987 6.00033L0.832031 7.16699L5.4987 11.8337L15.4987 1.83366L14.332 0.666992L5.4987 9.50033Z"
					fill="white"
				/>
			</svg>
		) }
	/>
);

export interface Props {
	slug: string;
	name: string;
	price: string;
	features: Array< string >;
	domainName?: string;
	isPopular?: boolean;
	isSelected?: boolean;
	onSelect: ( slug: string ) => void;
}

const PlanItem: React.FunctionComponent< Props > = ( {
	slug,
	name,
	price,
	isPopular = false,
	isSelected = false,
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
					{ isPopular && <div className="plan-item__badge">{ __( 'Popular' ) }</div> }
				</div>
				<div className="plan-item__price">
					<div className="plan-item__price-amount" data-is-loading={ ! price }>
						{ price || nbsp }
					</div>
					<div className="plan-item__price-note">{ __( 'per month, billed yearly' ) }</div>
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
					<div className="plan-item__domain-summary">{ __( 'Free domain for 1 year' ) }</div>
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
