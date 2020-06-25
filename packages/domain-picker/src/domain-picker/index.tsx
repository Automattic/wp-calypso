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
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import { useDomainSuggestions } from '../hooks/use-domain-suggestions';
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
	initialDomainSearch?: string;

	/** Called when the domain search query is changed */
	onSetDomainSearch: ( value: string ) => void;
}

const DomainPicker: FunctionComponent< Props > = ( {
	header,
	showDomainCategories,
	onDomainSelect,
	quantity = PAID_DOMAINS_TO_SHOW,
	quantityExpanded = PAID_DOMAINS_TO_SHOW_EXPANDED,
	analyticsFlowId,
	analyticsUiAlgo,
	domainSuggestionVendor,
	initialDomainSearch = '',
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

	const allDomainSuggestions = useDomainSuggestions(
		domainSearch.trim(),
		quantityExpanded,
		domainCategory,
		useI18n().i18nLocale
	) as DomainSuggestion[] | undefined;

	const domainSuggestions = allDomainSuggestions?.slice(
		0,
		isExpanded ? quantityExpanded : quantity
	);

	// Put the free domain at the second place and things will be sorted properly
	if ( domainSuggestions && domainSuggestions.length > 1 ) {
		const freeDomainIndex = domainSuggestions.findIndex( ( domain ) => domain.is_free );
		if ( freeDomainIndex > -1 ) {
			const swap = domainSuggestions[ 1 ];
			domainSuggestions[ 1 ] = domainSuggestions[ freeDomainIndex ];
			domainSuggestions[ freeDomainIndex ] = swap;
		}
	}

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

	const handleItemRender = (
		suggestion: DomainSuggestion,
		railcarId: string,
		uiPosition: number,
		isRecommended: boolean
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
			result: isRecommended ? domain + '#recommended' : domain,
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
					// Unable to remove this instance due to it being a HotJar term: https://github.com/Automattic/wp-calypso/pull/43348#discussion_r442015229
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
						{ domainSuggestions?.map( ( suggestion, i ) => (
							<SuggestionItem
								key={ suggestion.domain_name }
								suggestion={ suggestion }
								railcarId={ baseRailcarId ? `${ baseRailcarId }${ i }` : undefined }
								isRecommended={ i === 0 }
								onRender={ () =>
									handleItemRender( suggestion, `${ baseRailcarId }${ i }`, i, i === 0 )
								}
								onSelect={ onDomainSelect }
							/>
						) ) ?? times( quantity, ( i ) => <SuggestionItemPlaceholder key={ i } /> ) }
						{ ! isExpanded &&
							allDomainSuggestions?.length &&
							allDomainSuggestions?.length > quantity && (
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
