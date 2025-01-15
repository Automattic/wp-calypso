/* eslint-disable wpcalypso/jsx-classname-namespace */

import { recordTrainTracksInteract } from '@automattic/calypso-analytics';
import { useLocalizeUrl } from '@automattic/i18n-utils';
import { Spinner, Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import * as React from 'react';
import InfoTooltip from '../info-tooltip';
import WrappingComponent from './suggestion-item-wrapper';

export const SUGGESTION_ITEM_TYPE_RADIO = 'radio';
export const SUGGESTION_ITEM_TYPE_BUTTON = 'button';
export const SUGGESTION_ITEM_TYPE_INDIVIDUAL = 'individual-item';
export type SUGGESTION_ITEM_TYPE =
	| typeof SUGGESTION_ITEM_TYPE_RADIO
	| typeof SUGGESTION_ITEM_TYPE_BUTTON
	| typeof SUGGESTION_ITEM_TYPE_INDIVIDUAL;

interface Props {
	isUnavailable?: boolean;
	domain: string;
	isLoading?: boolean;
	cost?: string;
	hstsRequired?: boolean;
	isDotGayNoticeRequired?: boolean;
	isFree?: boolean;
	isExistingSubdomain?: boolean;
	isRecommended?: boolean;
	railcarId: string | undefined;
	onRender: () => void;
	onSelect: ( domain: string ) => void;
	selected?: boolean;
	type?: SUGGESTION_ITEM_TYPE;
	buttonRef?: React.Ref< HTMLButtonElement >;
}

const DomainPickerSuggestionItem: React.FC< Props > = ( {
	isUnavailable,
	domain,
	isLoading,
	cost,
	railcarId,
	hstsRequired = false,
	isDotGayNoticeRequired = false,
	isFree = false,
	isExistingSubdomain = false,
	isRecommended = false,
	onSelect,
	onRender,
	selected,
	type = SUGGESTION_ITEM_TYPE_RADIO,
	buttonRef,
} ) => {
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();

	const isMobile = ! useViewportMatch( 'small', '>=' );

	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const [ previousDomain, setPreviousDomain ] = React.useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = React.useState< string | undefined >();

	// translators: 'Default' will be shown next to the standard, free domain
	const freeDomainLabelDefault = __( 'Default', __i18n_text_domain__ );
	const freeDomainLabelFree = __( 'Free', __i18n_text_domain__ );
	const freeDomainLabel =
		type === SUGGESTION_ITEM_TYPE_INDIVIDUAL ? freeDomainLabelDefault : freeDomainLabelFree;
	const includedLabel = __( 'Included in annual plans', __i18n_text_domain__ );
	const includedLabelFormatted =
		// translators: text in between the <strong></strong> marks is styled as bold text
		__( '<strong>First year included</strong> in annual plans', __i18n_text_domain__ );
	const paidIncludedDomainLabel = isMobile
		? includedLabel
		: createInterpolateElement( includedLabelFormatted, {
				strong: <strong />,
		  } );

	React.useEffect( () => {
		// Only record TrainTracks render event when the domain name and railcarId change.
		// This effectively records the render event only once for each set of search results.
		if ( domain !== previousDomain && previousRailcarId !== railcarId && railcarId ) {
			onRender();
			setPreviousDomain( domain );
			setPreviousRailcarId( railcarId );
		}
	}, [ domain, previousDomain, previousRailcarId, railcarId, onRender ] );

	const onDomainSelect = () => {
		// Use previousRailcarId to make sure the select action matches the last rendered railcarId.
		if ( previousRailcarId ) {
			recordTrainTracksInteract( {
				action: 'domain_selected',
				railcarId: previousRailcarId,
			} );
		}
		onSelect( domain );
	};

	const selectButtonLabelSelected = __( 'Selected', __i18n_text_domain__ );
	const selectButtonLabelUnselected = __( 'Select', __i18n_text_domain__ );

	return (
		<WrappingComponent
			ref={ buttonRef }
			type={ type }
			key={ domainName }
			className={ clsx(
				'domain-picker__suggestion-item',
				{
					'is-free': isFree,
					'is-selected': selected,
					'is-unavailable': isUnavailable,
				},
				`type-${ type }`
			) }
			// if the wrapping element is a div, don't assign a click listener
			onClick={ type !== SUGGESTION_ITEM_TYPE_BUTTON ? onDomainSelect : undefined }
			disabled={ isUnavailable }
		>
			{ type === SUGGESTION_ITEM_TYPE_RADIO &&
				( isLoading ? (
					<Spinner />
				) : (
					<span
						className={ clsx( 'domain-picker__suggestion-radio-circle', {
							'is-checked': selected,
							'is-unavailable': isUnavailable,
						} ) }
					/>
				) ) }
			<div className="domain-picker__suggestion-item-name">
				<div className="domain-picker__suggestion-item-name-inner">
					<span
						className={ clsx( 'domain-picker__domain-wrapper', {
							'with-margin': ! ( hstsRequired || isDotGayNoticeRequired ),
						} ) }
					>
						<span className="domain-picker__domain-sub-domain">{ domainName }</span>
						<span className="domain-picker__domain-tld">{ domainTld }</span>
					</span>
					{ isRecommended && ! isUnavailable && (
						<div className="domain-picker__badge is-recommended">
							{ __( 'Recommended', __i18n_text_domain__ ) }
						</div>
					) }
					{ hstsRequired && (
						<InfoTooltip
							position={ isMobile ? 'bottom center' : 'middle right' }
							noArrow={ false }
							className="domain-picker__info-tooltip"
						>
							{ createInterpolateElement(
								__(
									'All domains ending with <tld /> require an SSL certificate to host a website. When you host this domain at WordPress.com an SSL certificate is included. <learn_more_link>Learn more</learn_more_link>',
									__i18n_text_domain__
								),
								{
									tld: <b>{ domainTld }</b>,
									learn_more_link: (
										<a
											target="_blank"
											rel="noreferrer"
											href={ localizeUrl( 'https://wordpress.com/support/domains/https-ssl/' ) }
										/>
									),
								}
							) }
						</InfoTooltip>
					) }
					{ isDotGayNoticeRequired && (
						<InfoTooltip
							position={ isMobile ? 'bottom center' : 'middle right' }
							noArrow={ false }
							className="domain-picker__info-tooltip"
						>
							{ __(
								'Any anti-LGBTQ content is prohibited and can result in registration termination. The registry will donate 20% of all registration revenue to LGBTQ non-profit organizations.',
								__i18n_text_domain__
							) }
						</InfoTooltip>
					) }
				</div>
				{ isExistingSubdomain && type !== SUGGESTION_ITEM_TYPE_INDIVIDUAL && (
					<div className="domain-picker__change-subdomain-tip">
						{ __(
							'You can change your free subdomain later under Domain Settings.',
							__i18n_text_domain__
						) }
					</div>
				) }
			</div>
			<div
				className={ clsx( 'domain-picker__price', {
					'is-paid': ! isFree,
				} ) }
			>
				{ isUnavailable && __( 'Unavailable', __i18n_text_domain__ ) }
				{ isFree && ! isUnavailable && freeDomainLabel }
				{ ! isFree && ! isUnavailable && (
					<>
						<span className="domain-picker__price-cost">
							{ sprintf(
								// translators: %s is the price with currency. Eg: $15/year
								__( '%s/year', __i18n_text_domain__ ),
								cost
							) }
						</span>
						<span className="domain-picker__price-inclusive">
							{ /* Intentional whitespace to get the spacing around the text right */ }{ ' ' }
							{ paidIncludedDomainLabel }{ ' ' }
						</span>
						<span className="domain-picker__price-renewal">
							{ sprintf(
								// translators: %s is the domain renewal cost (i.e. "Renews at: 20$ / year" )
								__( 'Renews at: %s /year', __i18n_text_domain__ ),
								cost
							) }
						</span>
					</>
				) }
			</div>
			{ type === SUGGESTION_ITEM_TYPE_BUTTON &&
				( isLoading ? (
					<Spinner />
				) : (
					<div className="domain-picker__action">
						<Button
							ref={ buttonRef }
							variant="secondary"
							className={ clsx( 'domain-picker__suggestion-select-button', {
								'is-selected': selected && ! isUnavailable,
							} ) }
							disabled={ isUnavailable }
							onClick={ onDomainSelect }
						>
							{ selected && ! isUnavailable
								? selectButtonLabelSelected
								: selectButtonLabelUnselected }
						</Button>
					</div>
				) ) }
		</WrappingComponent>
	);
};

export default React.forwardRef< HTMLButtonElement, Props >( ( props, ref ) => {
	return <DomainPickerSuggestionItem { ...props } buttonRef={ ref } />;
} );
