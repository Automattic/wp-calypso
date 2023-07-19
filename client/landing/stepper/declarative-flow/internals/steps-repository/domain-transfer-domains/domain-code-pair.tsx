import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FormInputValidation } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { Button, Icon } from '@wordpress/components';
import { check, trash, closeSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useEffect } from 'react';
import Gridicon from 'calypso/../packages/components/src/gridicon';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormExplanation from 'calypso/components/forms/form-setting-explanation';
import FormInput from 'calypso/components/forms/form-text-input';
import InfoPopover from 'calypso/components/info-popover';
import { useValidationMessage } from './use-validation-message';

type Props = {
	id: string;
	domain: string;
	auth: string;
	onChange: (
		id: string,
		value: {
			domain: string;
			auth: string;
			valid: boolean;
			rawPrice: number;
			saleCost?: number;
			currencyCode: string;
		}
	) => void;
	onRemove: ( id: string ) => void;
	showLabels: boolean;
	hasDuplicates: boolean;
	domainCount: number;
};

type DomainPriceProps = {
	rawPrice?: number;
	saleCost?: number;
	currencyCode: string;
};

const domainInputFieldIcon = ( isValidDomain: boolean, shouldReportError: boolean ) => {
	return (
		shouldReportError && (
			<span className="domains__domain-input-icon-container">
				<Icon
					size={ 24 }
					icon={ isValidDomain ? check : closeSmall }
					className={ classnames( 'domains__domain-input-icon', {
						'is-valid': isValidDomain,
						'is-not-valid': ! isValidDomain,
					} ) }
				/>
			</span>
		)
	);
};

const DomainPrice = ( { rawPrice, saleCost, currencyCode = 'USD' }: DomainPriceProps ) => {
	const { __ } = useI18n();

	if ( ! rawPrice ) {
		return (
			<div className="domains__domain-price-number disabled">
				{ formatCurrency( 0, currencyCode, { stripZeros: true } ) }
			</div>
		);
	}

	if ( ! saleCost && saleCost !== 0 ) {
		return (
			<div className="domains__domain-price-number">
				{ formatCurrency( rawPrice, currencyCode, { stripZeros: true } ) }
			</div>
		);
	}

	return (
		<div className="domains__domain-price-value">
			<div>
				<span className="domains__domain-price-number">
					{ formatCurrency( saleCost, currencyCode, { stripZeros: true } ) }
				</span>
				<span className="domains__domain-price-number raw-price">
					{ formatCurrency( rawPrice, currencyCode, { stripZeros: true } ) }
				</span>
			</div>
			<div className="domains__domain-price-text">{ __( 'First year free' ) }</div>
		</div>
	);
};

export function DomainCodePair( {
	id,
	domain,
	auth,
	onChange,
	onRemove,
	showLabels,
	hasDuplicates,
	domainCount,
}: Props ) {
	const { __ } = useI18n();

	const validation = useValidationMessage( domain, auth, hasDuplicates );

	const {
		valid,
		loading,
		message,
		rawPrice = 0,
		saleCost,
		currencyCode = 'USD',
		refetch,
		errorStatus,
	} = validation;

	useEffect( () => {
		onChange( id, { domain, auth, valid, rawPrice, saleCost, currencyCode } );
	}, [ domain, id, onChange, auth, valid, loading, rawPrice, saleCost, currencyCode ] );

	const shouldReportError = hasDuplicates || ( ! loading && domain && auth ? true : false );

	useEffect( () => {
		if ( shouldReportError && ! valid && message ) {
			recordTracksEvent( 'calypso_domain_transfer_domain_error', {
				domain,
				error: errorStatus ? errorStatus : message,
			} );
		}
	}, [ shouldReportError, valid, domain, message, errorStatus ] );

	return (
		<div className="domains__domain-info-and-validation">
			<div className="domains__domain-info">
				<div className="domains__domain-domain">
					<FormFieldset>
						<FormLabel
							className={ classnames( {
								'is-first-row': showLabels,
							} ) }
							htmlFor={ id }
						>
							{ __( 'Domain name' ) }
						</FormLabel>
						<FormInput
							disabled={ valid }
							id={ id }
							value={ domain }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, {
									domain: event.target.value.trim().toLowerCase(),
									auth,
									valid,
									rawPrice,
									saleCost,
									currencyCode,
								} )
							}
						/>
						{ domainInputFieldIcon( valid, shouldReportError ) }
					</FormFieldset>
				</div>
				<div className="domains__domain-key">
					<FormFieldset>
						<FormLabel
							className={ classnames( {
								'is-first-row': showLabels,
							} ) }
							htmlFor={ id + '-auth' }
						>
							{ __( 'Authorization code' ) }
							<InfoPopover
								className={ classnames( {
									'is-first-row': showLabels,
								} ) }
								position="right"
							>
								{ __(
									'Unique code proving ownership, needed for secure domain transfer between registrars.'
								) }
							</InfoPopover>
						</FormLabel>

						<FormInput
							id={ id + '-auth' }
							disabled={ valid || hasDuplicates }
							value={ auth }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								onChange( id, {
									domain,
									auth: event.target.value.trim(),
									valid,
									rawPrice,
									saleCost,
									currencyCode,
								} )
							}
						/>
						{ domainInputFieldIcon( valid, shouldReportError ) }
					</FormFieldset>
				</div>
				{ ( shouldReportError || ( message && loading ) ) && (
					<div className="domains__domain-validation is-mobile">
						{ shouldReportError && (
							<FormInputValidation isError={ ! valid } text={ message }></FormInputValidation>
						) }
						{ message && loading && (
							<div>
								<FormExplanation>{ message }</FormExplanation>
							</div>
						) }
					</div>
				) }
				<div className="domains__domain-price">
					<FormFieldset>
						<FormLabel
							className={ classnames( {
								'is-first-row': showLabels,
							} ) }
							htmlFor={ id + '-price' }
						>
							{ __( 'Price' ) }
						</FormLabel>
						<DomainPrice
							rawPrice={ rawPrice }
							saleCost={ saleCost }
							currencyCode={ currencyCode }
						/>
					</FormFieldset>
				</div>
				<div className="domains__domain-controls">
					<div className="domains__domain-delete">
						<Button
							// Disable the delete button on initial state meaning. no domain, no auth and one row.
							disabled={ ! domain && ! auth && domainCount === 1 }
							icon={ trash }
							onClick={ () => onRemove( id ) }
						>
							<span className="delete-label">{ __( 'Delete' ) }</span>
						</Button>
					</div>
					<div
						className={ classnames( 'domains__domain-refresh', {
							'is-invisible-field': ! refetch,
						} ) }
					>
						<Button
							icon={ <Gridicon icon="sync" width={ 24 } height={ 24 } /> }
							title={ __( 'Refresh' ) }
							disabled={ ! refetch }
							onClick={ () => refetch?.() }
						>
							<span className="refresh-label">{ __( 'Refresh' ) }</span>
						</Button>
					</div>
				</div>
			</div>
			<div className="domains__domain-validation is-desktop">
				{ shouldReportError && (
					<FormInputValidation isError={ ! valid } text={ message }></FormInputValidation>
				) }
				{ message && loading && (
					<div>
						<FormExplanation>{ message }</FormExplanation>
					</div>
				) }
			</div>
		</div>
	);
}
