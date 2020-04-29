/**
 * External dependencies
 */
import { times } from 'lodash';
import { Button, Panel, PanelBody, PanelRow, TextControl, Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';
import type { FunctionComponent } from 'react'; // eslint-disable-line

/**
 * Eh… 😅
 */
import SuggestionItem from '../../../../../../client/landing/gutenboarding/components/domain-picker/suggestion-item';
import SuggestionNone from '../../../../../../client/landing/gutenboarding/components/domain-picker/suggestion-none';
import SuggestionItemPlaceholder from '../../../../../../client/landing/gutenboarding/components/domain-picker/suggestion-item-placeholder';

/**
 * Internal dependencies
 */
import { DOMAIN_SUGGESTIONS_STORE, DomainSuggestion } from '../data-stores';

const PAID_DOMAINS_TO_SHOW = 5;

// @TODO: Add these as selectors on the store???
function getFreeDomainSuggestions( allSuggestions: DomainSuggestion[] | undefined ) {
	return allSuggestions?.filter( ( suggestion ) => suggestion.is_free );
}
function getPaidDomainSuggestions( allSuggestions: DomainSuggestion[] | undefined ) {
	return allSuggestions?.filter( ( suggestion ) => ! suggestion.is_free );
}
export function getRecommendedDomainSuggestion( allSuggestions: DomainSuggestion[] | undefined ) {
	if ( ! ( Array.isArray( allSuggestions ) && allSuggestions.length > 0 ) ) {
		return;
	}
	const recommendedSuggestion = allSuggestions?.reduce( ( result, suggestion ) => {
		if ( result.match_reasons?.includes( 'exact-match' ) ) {
			return result;
		}
		if ( suggestion.match_reasons?.includes( 'exact-match' ) ) {
			return suggestion;
		}
		if ( suggestion.relevance > result.relevance ) {
			return suggestion;
		}
		return result;
	} );

	return recommendedSuggestion;
}

const DomainPicker: FunctionComponent = () => {
	const { __ } = useI18n();
	const label = __( 'Search for a domain' );
	const onDomainSelect = ( d: DomainSuggestion ) =>
		console.log( "Contratulations! You've selected: %o", d.domain_name );
	const [ domainSearch, setDomainSearch ] = useState< string >( '' );
	const [ currentSelection, setCurrentSelection ] = useState< DomainSuggestion | undefined >(
		undefined
	);

	const allSuggestions = useSelect(
		( select ) => {
			if ( ! domainSearch ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch );
		},
		[ domainSearch ]
	);
	const freeSuggestions = getFreeDomainSuggestions( allSuggestions );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice(
		0,
		PAID_DOMAINS_TO_SHOW
	);
	const recommendedSuggestion = getRecommendedDomainSuggestion( paidSuggestions );
	const hasSuggestions = freeSuggestions?.length || paidSuggestions?.length;

	const ConfirmButton: FunctionComponent< Button.ButtonProps > = ( { ...props } ) => {
		return (
			<Button
				className="domain-picker__confirm-button"
				isPrimary
				disabled={ ! hasSuggestions }
				onClick={ () => {
					currentSelection && onDomainSelect( currentSelection );
				} }
				{ ...props }
			>
				{ __( 'Confirm' ) }
			</Button>
		);
	};

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow className="domain-picker__panel-row-main">
					<div className="domain-picker__header">
						<div className="domain-picker__header-group">
							<div className="domain-picker__header-title">{ __( 'Choose a domain' ) }</div>
							<p>{ __( 'Free for the first year with any paid plan or connect a domain.' ) }</p>
						</div>
						<ConfirmButton />
					</div>
					<div className="domain-picker__search">
						<SearchIcon />
						<TextControl
							hideLabelFromVision
							label={ label }
							placeholder={ label }
							onChange={ setDomainSearch }
							value={ domainSearch }
						/>
					</div>
					<div className="domain-picker__body">
						<div className="domain-picker__suggestion-item-group">
							{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
							{ freeSuggestions &&
								( freeSuggestions.length ? (
									<SuggestionItem
										suggestion={ freeSuggestions[ 0 ] }
										isSelected={
											currentSelection?.domain_name === freeSuggestions[ 0 ].domain_name
										}
										onSelect={ setCurrentSelection }
									/>
								) : (
									<SuggestionNone />
								) ) }
							{ ! paidSuggestions &&
								times( PAID_DOMAINS_TO_SHOW - 1, ( i ) => (
									<SuggestionItemPlaceholder key={ i } />
								) ) }
							{ paidSuggestions &&
								( paidSuggestions?.length ? (
									paidSuggestions.map( ( suggestion ) => (
										<SuggestionItem
											suggestion={ suggestion }
											isRecommended={ suggestion === recommendedSuggestion }
											isSelected={ currentSelection?.domain_name === suggestion.domain_name }
											onSelect={ setCurrentSelection }
											key={ suggestion.domain_name }
										/>
									) )
								) : (
									<SuggestionNone />
								) ) }
						</div>
					</div>
				</PanelRow>
				<PanelRow className="domain-picker__panel-row-footer">
					<div className="domain-picker__footer">
						<ConfirmButton />
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

const SearchIcon = () => (
	<Icon
		icon={ () => (
			<svg
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M6 18L10 14.5" stroke="black" strokeWidth="1.5" />
				<circle cx="13.5" cy="11.5" r="4.75" stroke="black" strokeWidth="1.5" />
			</svg>
		) }
	/>
);

export default DomainPicker;
