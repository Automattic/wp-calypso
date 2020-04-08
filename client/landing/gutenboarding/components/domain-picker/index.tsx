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

const FreeDomainIcon = () => (
	<Icon
		icon={ () => (
			<svg
				width="15"
				height="15"
				viewBox="0 0 15 15"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M13.2878 8.60833L8.61291 13.2844C8.4918 13.4057 8.34798 13.5019 8.18968 13.5676C8.03137 13.6332 7.86169 13.667 7.69032 13.667C7.51895 13.667 7.34926 13.6332 7.19096 13.5676C7.03265 13.5019 6.88884 13.4057 6.76773 13.2844L1.16699 7.68876V1.16699H7.68706L13.2878 6.76919C13.5307 7.01358 13.667 7.34417 13.667 7.68876C13.667 8.03335 13.5307 8.36395 13.2878 8.60833V8.60833Z"
					stroke="#008A20"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx="4.50033" cy="4.50033" r="0.833333" fill="#008A20" />
			</svg>
		) }
	/>
);

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
						<div className="domain-picker__header-title">{ __( 'Choose a domain' ) }</div>
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
					<p className="domain-picker__free-text">
						<FreeDomainIcon />
						{ __( 'Free for the first year with any paid plan' ) }
					</p>
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
						<Button className="domain-picker__footer-button" isPrimary onClick={ () => onClose() }>
							{ __( 'Confirm' ) }
						</Button>
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
