/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import { times } from 'lodash';
import { Button, TextControl } from '@wordpress/components';
import { Icon, search } from '@wordpress/icons';
import { getNewRailcarId, recordTrainTracksRender } from '@automattic/calypso-analytics';
import { useI18n } from '@automattic/react-i18n';
import type { DomainSuggestions } from '@automattic/data-stores';
/**
 * Internal dependencies
 */
import SuggestionItem from './suggestion-item';
import SuggestionNone from './suggestion-none';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import { useDomainSuggestions } from '../hooks/use-domain-suggestions';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../utils/domain-suggestions';
import DomainCategories from '../domain-categories';
import { PAID_DOMAINS_TO_SHOW, PAID_DOMAINS_TO_SHOW_EXPANDED } from '../constants';
import { DomainNameExplanationImage } from '../domain-name-explanation/';
/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export interface Props {
	header: React.ReactElement;

	showDomainCategories?: boolean;

	/**
	 * Callback that will be invoked when a domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;

	/** Paid omain suggestions to show when the picker isn't expanded */
	quantity?: number;

	/** Domain suggestions to show when the picker is expanded */
	quantityExpanded?: number;

	currentDomain?: DomainSuggestion;

	/** The flow where the Domain Picker is used. Eg: Gutenboarding */
	analyticsFlowId: string;

	/** An identifier for the wrapping UI used for setting ui_algo. Eg: domain_popover */
	analyticsUiAlgo: string;

	domainSuggestionVendor: string;

	/** The initial domain search query */
	initialDomainSearch: string;

	/** Called when the domain search query is changed */
	onSetDomainSearch: ( value: string ) => void;
}

const DomainPicker: FunctionComponent< Props > = ( {
	header,
	showDomainCategories,
	onDomainSelect,
	quantity = PAID_DOMAINS_TO_SHOW,
	quantityExpanded = PAID_DOMAINS_TO_SHOW_EXPANDED,
	currentDomain,
	analyticsFlowId,
	analyticsUiAlgo,
	domainSuggestionVendor,
	initialDomainSearch,
	onSetDomainSearch,
} ) => {
	const { __ } = useI18n();
	const label = __( 'Search for a domain' );

	// We're not keeping the current selection in local state at the moment
	//const [ currentSelection, setCurrentSelection ] = useState( currentDomain );
	const [ isExpanded, setIsExpanded ] = useState( false );

	// keep domain query in local state to allow free editing of the input value while the modal is open
	const [ domainSearch, setDomainSearch ] = useState< string >( initialDomainSearch );
	const [ domainCategory, setDomainCategory ] = useState< string | undefined >();

	const domainSuggestions = useDomainSuggestions(
		domainSearch.trim(),
		quantityExpanded,
		domainCategory,
		useI18n().i18nLocale
	);

	// Reset expansion state after every search
	useEffect( () => {
		setIsExpanded( false );
	}, [ domainSearch ] );

	const allSuggestions = domainSuggestions;
	const freeSuggestions = getFreeDomainSuggestions( allSuggestions );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice(
		0,
		isExpanded ? quantityExpanded : quantity
	);
	const recommendedSuggestion = getRecommendedDomainSuggestion( paidSuggestions );

	// We're not using auto-selection right now.
	// useEffect( () => {
	// 	// Auto-select one of the domains when the search results change. If the currently
	// 	// confirmed domain is in the search results then select it. The user probably
	// 	// re-ran their previous query. Otherwise select the free domain suggestion.

	// 	if (
	// 		allSuggestions?.find(
	// 			( suggestion ) => currentDomain?.domain_name === suggestion.domain_name
	// 		)
	// 	) {
	// 		setCurrentSelection( currentDomain );
	// 		return;
	// 	}

	// 	// Recalculate free-domain suggestions inside the closure. `getFreeDomainSuggestions()`
	// 	// always returns a new object so it shouldn't be used in `useEffects()` dependencies list.
	// 	const latestFreeSuggestion = getFreeDomainSuggestions( allSuggestions );

	// 	if ( latestFreeSuggestion ) {
	// 		setCurrentSelection( latestFreeSuggestion[ 0 ] );
	// 	}
	// }, [ allSuggestions, currentDomain ] );

	/** The train track ID for analytics. See https://wp.me/PCYsg-bor */
	const [ baseRailcarId, setBaseRailcarId ] = useState< string | undefined >();
	useEffect( () => {
		// Only generate a railcarId when the domain suggestions change and are not empty.
		if ( domainSuggestions ) {
			setBaseRailcarId( getNewRailcarId( 'suggestion' ) );
		}
	}, [ domainSuggestions, setBaseRailcarId ] );

	const isRecommended = ( suggestion: DomainSuggestion ) => suggestion === recommendedSuggestion;

	const handleItemRender = (
		suggestion: DomainSuggestion,
		railcarId: string,
		uiPosition: number
	) => {
		const fetchAlgo = `/domains/search/${ domainSuggestionVendor }/${ analyticsFlowId }${
			domainCategory ? '/' + domainCategory : ''
		}`;

		const domain = suggestion.domain_name;

		recordTrainTracksRender( {
			uiAlgo: `/${ analyticsFlowId }/${ analyticsUiAlgo }`,
			fetchAlgo,
			query: domainSearch,
			railcarId,
			result: isRecommended( suggestion ) ? domain + '#recommended' : domain,
			uiPosition,
		} );
	};

	const handleInputChange = ( searchQuery: string ) => {
		setDomainSearch( searchQuery );
		onSetDomainSearch( searchQuery );
	};

	return (
		<div className="domain-picker">
			{ header }
			<div className="domain-picker__search">
				<div className="domain-picker__search-icon">
					<Icon icon={ search } />
				</div>
				<TextControl
					data-hj-whitelist
					hideLabelFromVision
					label={ label }
					placeholder={ label }
					onChange={ handleInputChange }
					value={ domainSearch }
				/>
			</div>
			{ domainSearch.trim() ? (
				<div className="domain-picker__body">
					{ showDomainCategories && (
						<div className="domain-picker__aside">
							<DomainCategories selected={ domainCategory } onSelect={ setDomainCategory } />
						</div>
					) }
					<div className="domain-picker__suggestion-item-group">
						{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
						{ freeSuggestions &&
							( freeSuggestions.length ? (
								<SuggestionItem
									suggestion={ freeSuggestions[ 0 ] }
									railcarId={ baseRailcarId ? `${ baseRailcarId }0` : undefined }
									isSelected={ currentDomain?.domain_name === freeSuggestions[ 0 ].domain_name }
									onRender={ () =>
										handleItemRender( freeSuggestions[ 0 ], `${ baseRailcarId }0`, 0 )
									}
									onSelect={ onDomainSelect }
								/>
							) : (
								<SuggestionNone />
							) ) }
						{ ! paidSuggestions &&
							times( quantity, ( i ) => <SuggestionItemPlaceholder key={ i } /> ) }
						{ paidSuggestions &&
							( paidSuggestions?.length ? (
								paidSuggestions.map( ( suggestion, i ) => (
									<SuggestionItem
										key={ suggestion.domain_name }
										suggestion={ suggestion }
										railcarId={ baseRailcarId ? `${ baseRailcarId }${ i + 1 }` : undefined }
										isSelected={ currentDomain?.domain_name === suggestion.domain_name }
										isRecommended={ isRecommended( suggestion ) }
										onRender={ () =>
											handleItemRender( suggestion, `${ baseRailcarId }${ i + 1 }`, i + 1 )
										}
										onSelect={ onDomainSelect }
									/>
								) )
							) : (
								<SuggestionNone />
							) ) }
						{ ! isExpanded && (
							<div className="domain-picker__show-more">
								<Button onClick={ () => setIsExpanded( true ) }>
									{ __( 'View more results' ) }
								</Button>
							</div>
						) }
					</div>
				</div>
			) : (
				<div className="domain-picker__empty-state">
					<p className="domain-picker__empty-state--text">
						{ __(
							'A domain name is the site address people type in their browser to visit your site.'
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
