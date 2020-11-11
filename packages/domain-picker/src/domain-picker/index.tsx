/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { useSelect } from '@wordpress/data';
import { noop, times } from 'lodash';
import { Button, TextControl } from '@wordpress/components';
import { Icon, search } from '@wordpress/icons';
import { getNewRailcarId, recordTrainTracksRender } from '@automattic/calypso-analytics';
import type { DomainSuggestions } from '@automattic/data-stores';
import { DataStatus } from '@automattic/data-stores/src/domain-suggestions/constants';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SuggestionItem from './suggestion-item';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import { useDomainSuggestions } from '../hooks/use-domain-suggestions';
import { useDomainAvailabilities } from '../hooks/use-domain-availabilities';
import DomainCategories from '../domain-categories';
import {
	PAID_DOMAINS_TO_SHOW,
	PAID_DOMAINS_TO_SHOW_EXPANDED,
	DOMAIN_SUGGESTIONS_STORE,
	domainIsAvailableStatus,
} from '../constants';
import { DomainNameExplanationImage } from '../domain-name-explanation/';
import type { SUGGESTION_ITEM_TYPE } from './suggestion-item';
import { ITEM_TYPE_RADIO } from './suggestion-item';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export const ItemGrouper: FunctionComponent< {
	groupItems: boolean;
} > = function ItemGrouper( { groupItems, children } ) {
	if ( groupItems ) {
		return <div className="domain-picker__suggestion-item-group">{ children }</div>;
	}
	return <>{ children }</>;
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

	currentDomain?: string;

	isCheckingDomainAvailability?: boolean;

	existingSubdomain?: string;

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
} ) => {
	const label = __( 'Search for a domain', __i18n_text_domain__ );

	const [ isExpanded, setIsExpanded ] = useState( false );

	// keep domain query in local state to allow free editing of the input value while the modal is open
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
					/>
				</div>
			) }
			{ showErrorMessage && (
				<div className="domain-picker__error">
					<p className="domain-picker__error-message">
						{ __(
							'An error has occurred, please check your connection and retry.',
							__i18n_text_domain__
						) }
						{ domainSuggestionErrorMessage && ` ${ domainSuggestionErrorMessage }` }
					</p>
					<Button
						isPrimary
						className="domain-picker__error-retry-btn"
						onClick={ retryDomainSuggestionRequest }
					>
						Retry
					</Button>
				</div>
			) }
			{ showDomainSuggestionsResults && (
				<div className="domain-picker__body">
					{ showDomainCategories && (
						<div className="domain-picker__aside">
							<DomainCategories selected={ domainCategory } onSelect={ setDomainCategory } />
						</div>
					) }
					<div className="domain-picker__suggestion-sections">
						<>
							{ segregateFreeAndPaid && (
								<p className="domain-picker__suggestion-group-label">
									{ __( 'Keep sub-domain', __i18n_text_domain__ ) }
								</p>
							) }
							<ItemGrouper groupItems={ segregateFreeAndPaid }>
								{ existingSubdomain && (
									<SuggestionItem
										key={ existingSubdomain }
										domain={ existingSubdomain }
										cost="Free"
										isFree
										isExistingSubdomain
										railcarId={ baseRailcarId ? `${ baseRailcarId }${ 0 }` : undefined }
										onRender={ () =>
											handleItemRender( existingSubdomain, `${ baseRailcarId }${ 0 }`, 0, false )
										}
										selected={ currentDomain === existingSubdomain }
										onSelect={ () => {
											onExistingSubdomainSelect?.( existingSubdomain );
										} }
										type={ itemType }
									/>
								) }
							</ItemGrouper>
							{ segregateFreeAndPaid && (
								<p className="domain-picker__suggestion-group-label">
									{ __( 'Professional domains', __i18n_text_domain__ ) }
								</p>
							) }
							<ItemGrouper groupItems={ segregateFreeAndPaid }>
								{ domainSuggestions?.map( ( suggestion, i ) => {
									const index = existingSubdomain ? i + 1 : i;
									const isRecommended = index === 1;
									const availabilityStatus =
										domainAvailabilities[ suggestion?.domain_name ]?.status;
									// should availabilityStatus be falsy then we assume it is available as we have not checked yet.
									const isAvailable = availabilityStatus
										? domainIsAvailableStatus?.includes( availabilityStatus )
										: true;
									return (
										<SuggestionItem
											key={ suggestion.domain_name }
											isUnavailable={ ! isAvailable }
											domain={ suggestion.domain_name }
											cost={ suggestion.cost }
											isLoading={
												currentDomain === suggestion.domain_name && isCheckingDomainAvailability
											}
											hstsRequired={ suggestion.hsts_required }
											isFree={ suggestion.is_free }
											isRecommended={ isRecommended }
											railcarId={ baseRailcarId ? `${ baseRailcarId }${ index }` : undefined }
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
											selected={ currentDomain === suggestion.domain_name }
											type={ itemType }
										/>
									);
								} ) ?? times( quantity, ( i ) => <SuggestionItemPlaceholder key={ i } /> ) }
							</ItemGrouper>
						</>

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
			{ showDomainSuggestionsEmpty && (
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
