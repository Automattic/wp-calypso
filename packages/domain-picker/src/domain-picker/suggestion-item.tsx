/**
 * External dependencies
 */
import * as React from 'react';
import classnames from 'classnames';
import { useI18n } from '@automattic/react-i18n';
import { recordTrainTracksInteract } from '@automattic/calypso-analytics';
import { useLocalizeUrl } from '@automattic/i18n-utils';

/**
 * Wordpress dependencies
 */
import { createInterpolateElement } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import InfoTooltip from '../info-tooltip';
import WrappingComponent from './suggestion-item-wrapper';
// TODO: remove when all needed core types are available
/*#__PURE__*/ import '../types-patch';

export const ITEM_TYPE_RADIO = 'radio';
export const ITEM_TYPE_BUTTON = 'button';
export const ITEM_TYPE_INDIVIDUAL_ITEM = 'individual-item';
export type SUGGESTION_ITEM_TYPE =
	| typeof ITEM_TYPE_RADIO
	| typeof ITEM_TYPE_BUTTON
	| typeof ITEM_TYPE_INDIVIDUAL_ITEM;
interface Props {
	isUnavailable?: boolean;
	domain: string;
	isLoading?: boolean;
	cost?: string;
	hstsRequired?: boolean;
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
	isFree = false,
	isExistingSubdomain = false,
	isRecommended = false,
	onSelect,
	onRender,
	selected,
	type = ITEM_TYPE_RADIO,
	buttonRef,
} ) => {
	const { __ } = useI18n();
	const localizeUrl = useLocalizeUrl();

	const isMobile = useViewportMatch( 'small', '<' );

	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const [ previousDomain, setPreviousDomain ] = React.useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = React.useState< string | undefined >();

	// translators: 'Default' will be shown next to the standard, free domain
	const freeDomainLabelDefault = __( 'Default', __i18n_text_domain__ );
	const freeDomainLabelFree = __( 'Free', __i18n_text_domain__ );
	const freeDomainLabel =
		type === ITEM_TYPE_INDIVIDUAL_ITEM ? freeDomainLabelDefault : freeDomainLabelFree;

	const firstYearLabel = __( 'Included in annual plans', __i18n_text_domain__ );
	// translators: text in between the <strong></strong> marks is styled as bold text
	const firstYearLabelFormatted = __(
		'<strong>First year included</strong> in annual plans',
		__i18n_text_domain__
	);
	const paidIncludedDomainLabel = isMobile
		? firstYearLabel
		: createInterpolateElement( firstYearLabelFormatted, {
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
			className={ classnames(
				'domain-picker__suggestion-item',
				{
					'is-free': isFree,
					'is-selected': selected,
					'is-unavailable': isUnavailable,
				},
				`type-${ type }`
			) }
			// if the wrapping element is a div, don't assign a click listener
			onClick={ type !== 'button' ? onDomainSelect : undefined }
			disabled={ isUnavailable }
		>
			{ type === ITEM_TYPE_RADIO &&
				( isLoading ? (
					<Spinner />
				) : (
					<span
						className={ classnames( 'domain-picker__suggestion-radio-circle', {
							'is-checked': selected,
							'is-unavailable': isUnavailable,
						} ) }
					/>
				) ) }
			<div className="domain-picker__suggestion-item-name">
				<div className="domain-picker__suggestion-item-name-inner">
					<span
						className={ classnames( 'domain-picker__domain-wrapper', {
							'with-margin': ! hstsRequired,
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
											href={ localizeUrl( 'https://wordpress.com/support/https-ssl' ) }
										/>
									),
								}
							) }
						</InfoTooltip>
					) }
				</div>
				{ isExistingSubdomain && type !== ITEM_TYPE_INDIVIDUAL_ITEM && (
					<div className="domain-picker__change-subdomain-tip">
						{ __(
							'You can change your free subdomain later under Domain Settings.',
							__i18n_text_domain__
						) }
					</div>
				) }
			</div>
			<div
				className={ classnames( 'domain-picker__price', {
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
			{ type === ITEM_TYPE_BUTTON &&
				( isLoading ? (
					<Spinner />
				) : (
					<div className="domain-picker__action">
						<Button
							ref={ buttonRef }
							isSecondary
							className={ classnames( 'domain-picker__suggestion-select-button', {
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
