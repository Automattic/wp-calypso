/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import classnames from 'classnames';
import { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import './style.scss';
import DomainPickerButton from '../domain-picker-button';
import { selectorDebounce } from '../../constants';
import Link from '../link';
import { createSite } from '../../utils';
import { Step } from '../../steps';
import { useHistory } from 'react-router-dom';

const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register();

interface Props {
	prev?: string;
}

const Header: FunctionComponent< Props > = ( { prev } ) => {
	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );
	const { domain, selectedDesign, siteTitle, siteVertical, shouldCreate } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);
	const hasSelectedDesign = !! selectedDesign;
	const { setDomain, resetOnboardStore, setShouldCreate } = useDispatch( ONBOARD_STORE );

	const [ domainSearch ] = useDebounce( siteTitle, selectorDebounce );
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

	useEffect( () => {
		if ( ! siteTitle ) {
			setDomain( undefined );
		}
	}, [ siteTitle, setDomain ] );

	const history = useHistory();

	const [ isSiteCreating, setIsSiteCreating ] = useState( false );

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

	const siteUrl = currentDomain?.domain_name || siteTitle || currentUser?.username;
	const siteCreationData = {
		siteTitle,
		siteVertical,
		...( siteUrl && { siteUrl } ),
		...( selectedDesign?.slug && { theme: selectedDesign?.slug } ),
		onCreate: resetOnboardStore,
	};

	const handleCreateSite = useCallback( () => {
		setIsSiteCreating( true );
		createSite( siteCreationData );
	}, [ siteCreationData ] );

	useEffect( () => {
		if ( shouldCreate && currentUser && ! isSiteCreating ) {
			handleCreateSite();
		}
	}, [ shouldCreate, currentUser, isSiteCreating, handleCreateSite ] );

	const handleSignup = () => {
		setShouldCreate( true );
		history.push( Step.Signup );
	};

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
					{ hasSelectedDesign && ! isSiteCreating && ! shouldCreate && (
						<Button
							className="gutenboarding__header-next-button"
							isPrimary
							isLarge
							onClick={ () => ( currentUser ? handleCreateSite() : handleSignup() ) }
						>
							{ NO__( 'Create my site' ) }
						</Button>
					) }
					{ /* Just an intermediary step until adding the loading modal/screen in https://github.com/Automattic/wp-calypso/pull/39266 */ }
					{ ( isSiteCreating || shouldCreate ) && 'Creating site in progress...' }
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Header;
