/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { Button, Panel, PanelBody, PanelRow, TextControl, Icon } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { STORE_KEY } from '../../stores/onboard';
import SuggestionItem from './suggestion-item';
import SuggestionNone from './suggestion-none';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';
import {
	getFreeDomainSuggestions,
	getPaidDomainSuggestions,
	getRecommendedDomainSuggestion,
} from '../../utils/domain-suggestions';
import CloseButton from '../close-button';
import { useDomainSuggestions } from '../../hooks/use-domain-suggestions';
import { PAID_DOMAINS_TO_SHOW } from '../../constants';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export interface Props {
	/**
	 * Callback that will be invoked when a domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when a close button is clicked
	 */
	onClose: () => void;

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;

	currentDomain?: DomainSuggestion;
}

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

const DomainPicker: FunctionComponent< Props > = ( { onDomainSelect, onClose, currentDomain } ) => {
	const { __ } = useI18n();
	const label = __( 'Search for a domain' );

	const { domainSearch } = useSelect( select => select( STORE_KEY ).getState() );
	const { setDomainSearch } = useDispatch( STORE_KEY );

	const allSuggestions = useDomainSuggestions();
	const freeSuggestions = getFreeDomainSuggestions( allSuggestions );
	const paidSuggestions = getPaidDomainSuggestions( allSuggestions )?.slice(
		0,
		PAID_DOMAINS_TO_SHOW
	);
	const recommendedSuggestion = getRecommendedDomainSuggestion( paidSuggestions );

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__header">
						<div className="domain-picker__header-group">
							<div className="domain-picker__header-title">{ __( 'Choose a domain' ) }</div>
							<p>{ __( 'Free for the first year with any paid plan' ) }</p>
						</div>
						<CloseButton onClose={ () => onClose() } />
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
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-item-group">
						{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
						{ freeSuggestions &&
							( freeSuggestions.length ? (
								<SuggestionItem
									suggestion={ freeSuggestions[ 0 ] }
									isSelected={ currentDomain?.domain_name === freeSuggestions[ 0 ].domain_name }
									onSelect={ onDomainSelect }
								/>
							) : (
								<SuggestionNone />
							) ) }
						{ ! paidSuggestions &&
							times( PAID_DOMAINS_TO_SHOW - 1, i => <SuggestionItemPlaceholder key={ i } /> ) }
						{ paidSuggestions &&
							( paidSuggestions?.length ? (
								paidSuggestions.map( suggestion => (
									<SuggestionItem
										suggestion={ suggestion }
										isRecommended={ suggestion === recommendedSuggestion }
										isSelected={ currentDomain?.domain_name === suggestion.domain_name }
										onSelect={ onDomainSelect }
										key={ suggestion.domain_name }
									/>
								) )
							) : (
								<SuggestionNone />
							) ) }
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__footer">
						<div className="domain-picker__footer-options"></div>
						<Button
							className="domain-picker__footer-button"
							disabled={ ! freeSuggestions?.length && ! paidSuggestions?.length }
							isPrimary
							onClick={ onClose }
						>
							{ __( 'Confirm' ) }
						</Button>
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
