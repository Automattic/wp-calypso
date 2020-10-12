/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { createInterpolateElement } from '@wordpress/element';
import { Spinner } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import classnames from 'classnames';
import { sprintf } from '@wordpress/i18n';
import { v4 as uuid } from 'uuid';
import { recordTrainTracksInteract } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import InfoTooltip from '../info-tooltip';
// TODO: remove when all needed core types are available
/*#__PURE__*/ import '../types-patch';

interface Props {
	isUnavailable?: boolean;
	domain: string;
	isLoading?: boolean;
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
} ) => {
	const { __ } = useI18n();
	const isMobile = useViewportMatch( 'small', '<' );

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
				'is-unavailable': isUnavailable,
			} ) }
		>
			{ isLoading ? (
				<Spinner />
			) : (
				<input
					aria-labelledby={ labelId }
					className="domain-picker__suggestion-radio-button"
					type="radio"
					disabled={ isUnavailable }
					name="domain-picker-suggestion-option"
					onChange={ onDomainSelect }
					checked={ selected && ! isUnavailable }
				/>
			) }
			<div className="domain-picker__suggestion-item-name">
				<div className="domain-picker__suggestion-item-name-inner">
					<span className="domain-picker__domain-name">{ domainName }</span>
					<span
						className={ classnames( 'domain-picker__domain-tld', {
							'with-margin': ! hstsRequired,
						} ) }
					>
						{ domainTld }
					</span>
					{ hstsRequired && (
						<InfoTooltip
							position={ isMobile ? 'bottom center' : 'middle right' }
							noArrow={ false }
							className="domain-picker__info-tooltip"
						>
							{ createInterpolateElement(
								__(
									'All domains ending with <tld /> require an SSL certificate to host a website. When you host this domain at WordPress.com an SSL certificate is included. <learn_more_link>Learn more</learn_more_link>'
								),
								{
									tld: <b>{ domainTld }</b>,
									learn_more_link: (
										<a
											target="_blank"
											rel="noreferrer"
											href="https://wordpress.com/support/https-ssl"
										/>
									), // TODO Wrap this in `localizeUrl` from lib/i18n-utils
								}
							) }
						</InfoTooltip>
					) }
					{ isRecommended && ! isUnavailable && (
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
				{ isUnavailable && __( 'Unavailable' ) }
				{ isFree && ! isUnavailable && __( 'Free' ) }
				{ ! isFree && ! isUnavailable && (
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
