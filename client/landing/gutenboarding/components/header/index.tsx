/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import React, { FunctionComponent } from 'react';
import { useDebounce } from 'use-debounce';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import './style.scss';
import DomainPickerButton from '../domain-picker-button';
import { selectorDebounce } from '../../constants';
import Link from '../link';

const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register();

interface Props {
	prev?: string;
}

const Header: FunctionComponent< Props > = ( { prev } ) => {
	const { domain, selectedDesign, siteTitle, siteVertical } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);
	const hasSelectedDesign = !! selectedDesign;
	const { setDomain } = useDispatch( ONBOARD_STORE );

	const [ domainSearch ] = useDebounce(
		// If we know a domain, do not search.
		! domain && siteTitle,
		selectorDebounce
	);
	const freeDomainSuggestion = useSelect(
		select => {
			if ( ! domainSearch ) {
				return;
			}
			return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( domainSearch, {
				// Avoid `only_wordpressdotcom` — it seems to fail to find results sometimes
				include_wordpressdotcom: true,
				quantity: 1,
				...{ vertical: siteVertical?.id },
			} )?.[ 0 ];
		},
		[ domainSearch, siteVertical ]
	);

	const currentDomain = domain ?? freeDomainSuggestion;

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const siteTitleElement = (
		<span className="gutenboarding__site-title">
			{ siteTitle ? siteTitle : NO__( 'Create your site' ) }
		</span>
	);

	const domainElement = (
		<span
			className={ classnames( 'gutenboarding__header-domain-picker-button-domain', {
				placeholder: ! currentDomain,
			} ) }
		>
			{ currentDomain ? currentDomain.domain_name : 'example.wordpress.com' }
		</span>
	);

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<div className="gutenboarding__header-section">
				<div className="gutenboarding__header-group">
					<Link className="gutenboarding__header-back-button" to={ prev }>
						<Icon icon="arrow-left-alt" />
						{ NO__( 'Back' ) }
					</Link>
				</div>
				<div className="gutenboarding__header-group">
					{ siteTitle ? (
						<DomainPickerButton
							className="gutenboarding__header-domain-picker-button"
							defaultQuery={ siteTitle }
							disabled={ ! currentDomain }
							onDomainSelect={ setDomain }
							queryParameters={ { vertical: siteVertical?.id } }
						>
							{ siteTitleElement }
							{ domainElement }
						</DomainPickerButton>
					) : (
						siteTitleElement
					) }
				</div>
			</div>
			<div className="gutenboarding__header-section">
				<div className="gutenboarding__header-group">
					{ hasSelectedDesign && (
						<Button
							href={ addQueryArgs( '/start/frankenflow', {
								siteTitle: siteTitle,
								...( selectedDesign?.slug && { theme: selectedDesign.slug } ),
							} ) }
							className="gutenboarding__header-next-button"
							isPrimary
							isLarge
						>
							{ NO__( 'Create my site' ) }
						</Button>
					) }
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Header;
