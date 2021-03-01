/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect, Fragment } from 'react';
import { useSelect } from '@wordpress/data';
import { noop, times } from 'lodash';
import { Button, TextControl, Notice } from '@wordpress/components';
import { Icon, search } from '@wordpress/icons';
import { getNewRailcarId, recordTrainTracksRender } from '@automattic/calypso-analytics';
import { DataStatus } from '@automattic/data-stores/src/domain-suggestions/constants';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import SuggestionItem from './suggestion-item';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import UseYourDomainItem from './use-your-domain-item';
import {
	useDomainSuggestions,
	useDomainAvailabilities,
	usePersistentSelectedDomain,
} from '../hooks';
import DomainCategories from '../domain-categories';
import {
	PAID_DOMAINS_TO_SHOW,
	PAID_DOMAINS_TO_SHOW_EXPANDED,
	DOMAIN_SUGGESTIONS_STORE,
	domainIsAvailableStatus,
} from '../constants';
import { DomainNameExplanationImage } from '../domain-name-explanation/';
import { ITEM_TYPE_RADIO } from './suggestion-item';
import type { SUGGESTION_ITEM_TYPE } from './suggestion-item';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;
type DomainGroup = 'sub-domain' | 'professional';

export const ItemGrouper: FunctionComponent< {
	groupItems: boolean;
} > = function ItemGrouper( { groupItems, children } ) {
	if ( groupItems ) {
		return <div className="domain-picker__suggestion-item-group">{ children }</div>;
	}
	return <>{ children }</>;
};

export const ItemGroupLabel: FunctionComponent = function ItemGroupLabel( { children } ) {
	return <p className="domain-picker__suggestion-group-label">{ children }</p>;
};

export interface Props {
	header?: React.ReactElement;

	showDomainCategories?: boolean;

	/**
	 * Callback that will be invoked when a domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;

	onExistingSubdomainSelect?: ( existingSubdomain: string ) => void;

	/** Paid domain suggestions to show when the picker isn't expanded */
	quantity?: number;

	/** Domain suggestions to show when the picker is expanded */
	quantityExpanded?: number;

	/** Called when the user leaves the search box */
	onDomainSearchBlur?: ( value: string ) => void;

	currentDomain?: DomainSuggestion;

	isCheckingDomainAvailability?: boolean;

	existingSubdomain?: DomainSuggestion;

	/* this makes the domain picker in loading state */
	areDependenciesLoading?: boolean;

	/** The flow where the Domain Picker is used. Eg: Gutenboarding */
	analyticsFlowId: string;

	/** An identifier for the wrapping UI used for setting ui_algo. Eg: domain_popover */
	analyticsUiAlgo: string;

	/** The initial domain search query */
	initialDomainSearch?: string;

	/** Called when the domain search query is changed */
	onSetDomainSearch?: ( value: string ) => void;

	/** Whether to segregate free and paid domains from each other */
	segregateFreeAndPaid?: boolean;

	/** Whether to show search field or not. Defaults to true */
	showSearchField?: boolean;

	/** Whether to show radio button or select button. Defaults to radio button */
	itemType?: SUGGESTION_ITEM_TYPE;

	locale?: string;

	/** Whether we show the free .wordpress.com sub-domain first or last */
	orderSubDomainsLast?: boolean;

	/** Callback for when a user clicks "Use a domain I own" item */
	onUseYourDomainClick?: () => void;
}

const DomainPicker: FunctionComponent< Props > = ( {
	header,
	showDomainCategories,
	onDomainSelect,
	onExistingSubdomainSelect,
	quantity = PAID_DOMAINS_TO_SHOW,
	quantityExpanded = PAID_DOMAINS_TO_SHOW_EXPANDED,
	onDomainSearchBlur = noop,
	analyticsFlowId,
	analyticsUiAlgo,
	initialDomainSearch = '',
	onSetDomainSearch = noop,
	currentDomain,
	isCheckingDomainAvailability,
	existingSubdomain,
	segregateFreeAndPaid = false,
	showSearchField = true,
	itemType = ITEM_TYPE_RADIO,
	locale,
	areDependenciesLoading = false,
	orderSubDomainsLast = false,
	onUseYourDomainClick,
} ) => {
	const { __ } = useI18n();
	const label = __( 'Search for a domain', __i18n_text_domain__ );

	const [ isExpanded, setIsExpanded ] = useState( false );
	// Keep domain query in local state to allow free editing of the input value while the modal is open
	const [ domainSearch, setDomainSearch ] = useState< string >( initialDomainSearch );
	const [ domainCategory, setDomainCategory ] = useState< string | undefined >();

	const domainSuggestionVendor = useSelect( ( select ) =>
		select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestionVendor()
	);

	const {
		allDomainSuggestions,
		errorMessage: domainSuggestionErrorMessage,
		state: domainSuggestionState,
		retryRequest: retryDomainSuggestionRequest,
	} = useDomainSuggestions( domainSearch.trim(), quantityExpanded, domainCategory, locale ) || {};

	const domainSuggestions = allDomainSuggestions?.slice(
		existingSubdomain ? 1 : 0,
		isExpanded ? quantityExpanded : quantity
	);

	const persistentSelectedDomain = usePersistentSelectedDomain(
		domainSuggestions,
		existingSubdomain,
		currentDomain
	);

	if ( persistentSelectedDomain ) {
		// Append our currently selected domain to the suggestions so it's persistently visible to the user.
		domainSuggestions?.push( persistentSelectedDomain );
	}

	const domainAvailabilities = useDomainAvailabilities();

	const onDomainSearchBlurValue = ( event: React.FormEvent< HTMLInputElement > ) => {
		if ( onDomainSearchBlur ) {
			onDomainSearchBlur( event.currentTarget.value );
		}
	};

	// Reset expansion state after every search
	useEffect( () => {
		setIsExpanded( false );
	}, [ domainSearch ] );

	/** The train track ID for analytics. See https://wp.me/PCYsg-bor */
	const [ baseRailcarId, setBaseRailcarId ] = useState< string | undefined >();

	useEffect( () => {
		// Only generate a railcarId when the domain suggestions change and are not empty.
		if ( allDomainSuggestions ) {
			setBaseRailcarId( getNewRailcarId( 'suggestion' ) );
		}
	}, [ allDomainSuggestions, setBaseRailcarId ] );

	// Update domain search query using initialDomainSearch prop if there is no search field
	useEffect( () => {
		if ( ! showSearchField ) {
			setDomainSearch( initialDomainSearch );
		}
	}, [ initialDomainSearch, showSearchField ] );

	const suggestionRefs = React.useRef< ( HTMLButtonElement | null )[] >( [] );
	useEffect( () => {
		if ( isExpanded ) {
			suggestionRefs.current[ quantity ]?.focus?.();
		}
	}, [ isExpanded, quantity ] );

	const handleItemRender = (
		domain: string,
		railcarId: string,
		uiPosition: number,
		isRecommended: boolean
	) => {
		const fetchAlgo = `/domains/search/${ domainSuggestionVendor }/${ analyticsFlowId }${
			domainCategory ? '/' + domainCategory : ''
		}`;

		recordTrainTracksRender( {
			uiAlgo: `/${ analyticsFlowId }/${ analyticsUiAlgo }`,
			fetchAlgo,
			query: domainSearch,
			railcarId,
			result: isRecommended ? domain + '#recommended' : domain,
			uiPosition,
		} );
	};

	const handleInputChange = ( searchQuery: string ) => {
		setDomainSearch( searchQuery );
		onSetDomainSearch( searchQuery );
	};

	const showErrorMessage = domainSuggestionState === DataStatus.Failure;
	const isDomainSearchEmpty = domainSearch.trim?.().length <= 1;
	const showDomainSuggestionsResults = ! showErrorMessage && ! isDomainSearchEmpty;
	const showDomainSuggestionsEmpty = ! showErrorMessage && isDomainSearchEmpty;

	let placeholdersCount = quantity;
	// If persistentSelectedDomain exists, a placeholder will be appended to the list when doing next search
	if ( persistentSelectedDomain ) {
		placeholdersCount += 1;
	}
	// If onUseYourDomainClick is defined, UseYourDomainItem will appended to the list of options
	if ( onUseYourDomainClick ) {
		placeholdersCount += 1;
	}
	// If existingSubdomain is defined, it will be rendered separately with its own placeholder
	if ( existingSubdomain ) {
		placeholdersCount -= 1;
	}

	// We are specifcying the order of domains by sub-domains and professional domains.
	const groupOrder: DomainGroup[] = [ 'professional' ];
	existingSubdomain && groupOrder.unshift( 'sub-domain' ); // add 'sub-domain' group only when needed
	if ( orderSubDomainsLast ) {
		groupOrder.reverse();
	}

	return (
		<div className="domain-picker">
			{ header && header }
			{ showSearchField && (
				<div className="domain-picker__search">
					<div className="domain-picker__search-icon">
						<Icon icon={ search } />
					</div>
					<TextControl
						hideLabelFromVision
						label={ label }
						placeholder={ label }
						onChange={ handleInputChange }
						onBlur={ onDomainSearchBlurValue }
						value={ domainSearch }
						dir="ltr"
					/>
				</div>
			) }
			{ showErrorMessage && (
				<Notice className="domain-picker__error" status="error" isDismissible={ false }>
					<p className="domain-picker__error-message">
						{ domainSuggestionErrorMessage ||
							__(
								'An error has occurred, please check your connection and retry.',
								__i18n_text_domain__
							) }
					</p>
					<Button
						isPrimary
						className="domain-picker__error-retry-btn"
						onClick={ retryDomainSuggestionRequest }
					>
						{ __( 'Retry', __i18n_text_domain__ ) }
					</Button>
				</Notice>
			) }
			{ ( showDomainSuggestionsResults || areDependenciesLoading ) && (
				<div className="domain-picker__body">
					{ showDomainCategories && (
						<div className="domain-picker__aside">
							<DomainCategories selected={ domainCategory } onSelect={ setDomainCategory } />
						</div>
					) }
					<div className="domain-picker__suggestion-sections">
						<div className="domain-picker__sugggested-items-container">
							{ groupOrder.map( ( group: DomainGroup ) =>
								group === 'sub-domain' ? (
									<Fragment key={ group }>
										{ segregateFreeAndPaid && (
											<ItemGroupLabel>
												{ __( 'Keep sub-domain', __i18n_text_domain__ ) }
											</ItemGroupLabel>
										) }
										<ItemGrouper key={ group } groupItems={ segregateFreeAndPaid }>
											{ ( ! areDependenciesLoading && existingSubdomain && (
												<SuggestionItem
													key={ existingSubdomain?.domain_name }
													domain={ existingSubdomain?.domain_name }
													cost="Free"
													isFree
													isExistingSubdomain
													railcarId={ baseRailcarId ? `${ baseRailcarId }${ 0 }` : undefined }
													onRender={ () =>
														handleItemRender(
															existingSubdomain?.domain_name,
															`${ baseRailcarId }${ 0 }`,
															0,
															false
														)
													}
													selected={ currentDomain?.domain_name === existingSubdomain?.domain_name }
													onSelect={ () => {
														onExistingSubdomainSelect?.( existingSubdomain?.domain_name );
													} }
													type={ itemType }
												/>
											) ) || <SuggestionItemPlaceholder type={ itemType } /> }
										</ItemGrouper>
									</Fragment>
								) : (
									<Fragment key={ group }>
										{ segregateFreeAndPaid && (
											<ItemGroupLabel>
												{ __( 'Professional domains', __i18n_text_domain__ ) }
											</ItemGroupLabel>
										) }
										<ItemGrouper key={ group } groupItems={ segregateFreeAndPaid }>
											{ ( ! areDependenciesLoading &&
												domainSuggestions?.map( ( suggestion, i ) => {
													const index = existingSubdomain?.domain_name ? i + 1 : i;
													const isRecommended = index === 1;
													const availabilityStatus =
														domainAvailabilities[ suggestion?.domain_name ]?.status;
													// should availabilityStatus be falsy then we assume it is available as we have not checked yet.
													const isAvailable = availabilityStatus
														? domainIsAvailableStatus?.indexOf( availabilityStatus ) > -1
														: true;
													return (
														<SuggestionItem
															ref={ ( ref ) => {
																suggestionRefs.current[ index ] = ref;
															} }
															key={ suggestion.domain_name }
															isUnavailable={ ! isAvailable }
															domain={ suggestion.domain_name }
															cost={ suggestion.cost }
															isLoading={
																currentDomain?.domain_name === suggestion.domain_name &&
																isCheckingDomainAvailability
															}
															hstsRequired={ suggestion.hsts_required }
															isFree={ suggestion.is_free }
															isRecommended={ isRecommended }
															railcarId={
																baseRailcarId ? `${ baseRailcarId }${ index }` : undefined
															}
															onRender={ () =>
																handleItemRender(
																	suggestion.domain_name,
																	`${ baseRailcarId }${ index }`,
																	index,
																	isRecommended
																)
															}
															onSelect={ () => {
																onDomainSelect( suggestion );
															} }
															selected={ currentDomain?.domain_name === suggestion.domain_name }
															type={ itemType }
														/>
													);
												} ) ) ||
												times( placeholdersCount, ( i ) => (
													<SuggestionItemPlaceholder type={ itemType } key={ i } />
												) ) }
											{ onUseYourDomainClick && !! domainSuggestions && (
												<UseYourDomainItem onClick={ onUseYourDomainClick } />
											) }
										</ItemGrouper>
									</Fragment>
								)
							) }
						</div>

						{ ! isExpanded &&
							quantity < quantityExpanded &&
							allDomainSuggestions?.length &&
							allDomainSuggestions?.length > quantity && (
								<div className="domain-picker__show-more">
									<Button onClick={ () => setIsExpanded( true ) } isLink>
										{ __( 'View more results', __i18n_text_domain__ ) }
									</Button>
								</div>
							) }
					</div>
				</div>
			) }
			{ showDomainSuggestionsEmpty && ! areDependenciesLoading && (
				<div className="domain-picker__empty-state">
					<p className="domain-picker__empty-state--text">
						{ __(
							'A domain name is the site address people type in their browser to visit your site.',
							__i18n_text_domain__
						) }
					</p>
					<div>
						<DomainNameExplanationImage />
					</div>
				</div>
			) }
		</div>
	);
};

export default DomainPicker;
