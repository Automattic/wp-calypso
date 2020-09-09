/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { sprintf } from '@wordpress/i18n';
import { v4 as uuid } from 'uuid';
import { recordTrainTracksInteract } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import InfoTooltip from '../info-tooltip';

interface Props {
	domain: string;
	cost: string;
	hstsRequired?: boolean;
	isFree?: boolean;
	isExistingSubdomain?: boolean;
	isRecommended?: boolean;
	railcarId: string | undefined;
	onRender: () => void;
	onSelect: ( domain: string ) => void;
	selected?: boolean;
}

const DomainPickerSuggestionItem: FunctionComponent< Props > = ( {
	domain,
	cost,
	railcarId,
	hstsRequired = false,
	isFree = false,
	isExistingSubdomain = false,
	isRecommended = false,
	onSelect,
	onRender,
	selected,
} ) => {
	const { __ } = useI18n();

	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const [ previousDomain, setPreviousDomain ] = useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = useState< string | undefined >();

	const labelId = uuid();

	useEffect( () => {
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

	return (
		<label
			className={ classnames( 'domain-picker__suggestion-item', {
				'is-free': isFree,
				'is-selected': selected,
			} ) }
		>
			<input
				aria-labelledby={ labelId }
				className="domain-picker__suggestion-radio-button"
				type="radio"
				name="domain-picker-suggestion-option"
				onChange={ onDomainSelect }
				checked={ selected }
			/>
			<div className="domain-picker__suggestion-item-name">
				<div className="domain-picker__suggestion-item-name-inner">
					<span className="domain-picker__domain-name">{ domainName }</span>
					<span className="domain-picker__domain-tld">{ domainTld }</span>
					{ hstsRequired && (
						<InfoTooltip position="middle right" noArrow={ false }>
							{ __(
								'All domains ending with {{strong}}.dev{{/strong}} require an SSL certificate to host a website. When you host this domain at WordPress.com an SSL certificate is included. {{a}}Learn more{{/a}}',
								{
									components: {
										a: <a href="https://google.com" />,
										strong: <strong />,
									},
								}
							) }
						</InfoTooltip>
					) }
					{ isRecommended && (
						<div className="domain-picker__badge is-recommended">{ __( 'Recommended' ) }</div>
					) }
				</div>
				{ isExistingSubdomain && (
					<div className="domain-picker__change-subdomain-tip">
						{ __( 'You can change your free subdomain later under Domain Settings.' ) }
					</div>
				) }
			</div>
			<div
				className={ classnames( 'domain-picker__price', {
					'is-paid': ! isFree,
				} ) }
			>
				{ isFree ? (
					__( 'Free' )
				) : (
					<>
						<span className="domain-picker__price-inclusive"> { __( 'Included in plans' ) } </span>
						<span className="domain-picker__price-cost">
							{
								/* translators: %s is the price with currency. Eg: $15/year. */
								sprintf( __( '%s/year' ), cost )
							}
						</span>
					</>
				) }
			</div>
		</label>
	);
};

export default DomainPickerSuggestionItem;
