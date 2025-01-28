import { recordTracksEvent } from '@automattic/calypso-analytics';
import { FormInputValidation, FormLabel, Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { GOOGLE_TRANSFER, HUNDRED_YEAR_DOMAIN_TRANSFER } from '@automattic/onboarding';
import { Button, Icon } from '@wordpress/components';
import { check, closeSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInput from 'calypso/components/forms/form-text-input';
import InfoPopover from 'calypso/components/info-popover';
import { domainAvailability } from 'calypso/lib/domains/constants';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import GoogleDomainsModal from '../../components/google-domains-transfer-instructions';
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
	variantSlug: string | undefined;
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
					className={ clsx( 'domains__domain-input-icon', {
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
		return <div className="domains__domain-price-number disabled"></div>;
	}

	if ( ! saleCost && saleCost !== 0 ) {
		return (
			<div className="domains__domain-price-number">
				{ formatCurrency( rawPrice, currencyCode, { stripZeros: true } ) }
			</div>
		);
	}

	const pricetext = __( 'We’ll pay for an extra year' );

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
			<div className="domains__domain-price-text">{ pricetext }</div>
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
	variantSlug,
}: Props ) {
	const { __ } = useI18n();

	const isHundredYearDomainsTransferFlow = HUNDRED_YEAR_DOMAIN_TRANSFER === variantSlug;
	const validation = useValidationMessage( domain, auth, hasDuplicates, {
		vendor: isHundredYearDomainsTransferFlow ? '100-year-domains' : undefined,
	} );
	const isGoogleDomainsTransferFlow = GOOGLE_TRANSFER === variantSlug;
	const userCurrencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';

	const {
		valid,
		loading,
		message,
		rawPrice = 0,
		saleCost,
		currencyCode = userCurrencyCode,
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
				error: errorStatus ? errorStatus : String( message ),
			} );
		}
	}, [ shouldReportError, valid, domain, message, errorStatus ] );

	const domainActions = () => (
		<span className="validation-actions">
			{ isGoogleDomainsTransferFlow &&
				// this means that the domain is locked and we need to show the instructions
				errorStatus === domainAvailability.SERVER_TRANSFER_PROHIBITED_NOT_TRANSFERRABLE && (
					<GoogleDomainsModal
						className={ clsx( {
							'is-first-row': showLabels,
						} ) }
						focusedStep={ 3 }
					>
						<span className="unlock-label">{ __( 'How to unlock' ) }</span>
					</GoogleDomainsModal>
				) }
			<Button
				// Disable the delete button on initial state meaning. no domain, no auth and one row.
				disabled={ ! domain && ! auth && domainCount === 1 }
				onClick={ () => onRemove( id ) }
				variant="link"
			>
				<span className="delete-label">{ __( 'Clear domain' ) }</span>
			</Button>
			<Button
				title={ __( 'Refresh' ) }
				disabled={ ! refetch }
				onClick={ () => refetch?.() }
				className={ clsx( 'domains__domain-refresh', {
					'is-invisible-field': ! refetch,
				} ) }
				variant="link"
			>
				<span className="refresh-label">{ __( 'Try again' ) }</span>
			</Button>
		</span>
	);

	const renderGoogleDomainsModal = () => {
		return (
			<GoogleDomainsModal
				className={ clsx( {
					'is-first-row': showLabels,
				} ) }
				focusedStep={ 4 }
			>
				<Gridicon icon="info-outline" size={ 18 } />
			</GoogleDomainsModal>
		);
	};

	const renderInfoPopover = () => {
		return (
			<InfoPopover
				className={ clsx( {
					'is-first-row': showLabels,
				} ) }
				position="right"
			>
				{ isHundredYearDomainsTransferFlow
					? __(
							'Your secret key to unlock the domain transfer. Get yours from your current domain provider.'
					  )
					: __(
							'Unique code proving ownership, needed for secure domain transfer between registrars.'
					  ) }
				<div>
					<Button
						href={ localizeUrl(
							'https://wordpress.com/support/domains/incoming-domain-transfer/#step-2-unlock-your-domain-and-obtain-your-auth-code'
						) }
						target="_blank"
						variant="link"
					>
						<span className="learn-more-label">{ __( 'Learn more' ) }</span>
					</Button>
				</div>
			</InfoPopover>
		);
	};

	return (
		<div className={ `domains__domain-info-and-validation ${ getLocaleSlug() }` }>
			<div className="domains__domain-info">
				<div className="domains__domain-domain">
					<FormFieldset>
						<FormLabel
							className={ clsx( {
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
							className="domains__domain-name-input-field"
							placeholder={ __( 'example.com' ) }
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
							className={ clsx( {
								'is-first-row': showLabels,
							} ) }
							htmlFor={ id + '-auth' }
						>
							{ isGoogleDomainsTransferFlow ? __( 'Transfer code' ) : __( 'Authorization code' ) }
							{ isGoogleDomainsTransferFlow ? renderGoogleDomainsModal() : renderInfoPopover() }
						</FormLabel>

						<FormInput
							id={ id + '-auth' }
							disabled={ valid || hasDuplicates }
							value={ auth }
							placeholder="123"
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
					<div className="domains__domain-validation is-mobile">
						{ shouldReportError && (
							<FormInputValidation
								isError={ ! valid }
								text={ message }
								children={ domainActions() }
							></FormInputValidation>
						) }
						{ message && loading && (
							<FormInputValidation
								className="is-checking-domain"
								text={ message }
								isError={ false }
								isMuted
							/>
						) }
						{ ! shouldReportError && ! loading && (
							<FormInputValidation
								isError={ false }
								text=""
								isMuted
								children={ domainCount > 1 && domainActions() }
							/>
						) }
					</div>
				</div>
				<div className="domains__domain-price">
					<FormFieldset>
						<FormLabel
							className={ clsx( {
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
			</div>
			<div className="domains__domain-validation is-desktop">
				{ shouldReportError && (
					<FormInputValidation
						isError={ ! valid }
						text={ message }
						children={ domainActions() }
					></FormInputValidation>
				) }
				{ message && loading && (
					<FormInputValidation
						className="is-checking-domain"
						text={ message }
						isError={ false }
						isMuted
					/>
				) }
				{ ! shouldReportError && ! loading && (
					<FormInputValidation
						isError={ false }
						isMuted
						text=""
						children={ domainCount > 1 && domainActions() }
					/>
				) }
			</div>
		</div>
	);
}
