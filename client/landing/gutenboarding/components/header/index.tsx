/**
 * External dependencies
 */
import { useI18n } from '@automattic/react-i18n';
import { Button, Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent, useEffect, useCallback, useState } from 'react';
import { useDebounce } from 'use-debounce';
import classnames from 'classnames';
import { DomainSuggestions } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { USER_STORE } from '../../stores/user';
import { SITE_STORE } from '../../stores/site';
import './style.scss';
import DomainPickerButton from '../domain-picker-button';
import { selectorDebounce } from '../../constants';
import Link from '../link';
import SignupForm from '../../components/signup-form';

const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register();

interface Props {
	prev?: string;
}

const Header: FunctionComponent< Props > = ( { prev } ) => {
	const { __: NO__ } = useI18n();

	const currentUser = useSelect( select => select( USER_STORE ).getCurrentUser() );
	const newUser = useSelect( select => select( USER_STORE ).getNewUser() );

	const { createSite } = useDispatch( SITE_STORE );

	const newSite = useSelect( select => select( SITE_STORE ).getNewSite() );

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

	const [ showSignupDialog, setShowSignupDialog ] = useState( false );

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

	const handleCreateSite = useCallback(
		( username: string, bearerToken?: string ) => {
			const siteUrl = currentDomain?.domain_name || siteTitle || username;
			createSite( {
				blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
				blog_title: siteTitle,
				options: {
					site_vertical: siteVertical?.id,
					site_vertical_name: siteVertical?.label,
					site_information: {
						title: siteTitle,
					},
					site_creation_flow: 'gutenboarding',
					theme: `pub/${ selectedDesign?.slug }`,
				},
				...( bearerToken && { authToken: bearerToken } ),
			} );
		},
		[ createSite, currentDomain, selectedDesign, siteTitle, siteVertical ]
	);

	const handleSignup = () => {
		setShouldCreate( true );
		setShowSignupDialog( true );
	};

	useEffect( () => {
		if ( shouldCreate && newUser && newUser.bearerToken && newUser.username ) {
			handleCreateSite( newUser.username, newUser.bearerToken );
			setShouldCreate( false );
		}
	}, [ shouldCreate, newUser, handleCreateSite, setShouldCreate ] );

	useEffect( () => {
		if ( newSite ) {
			resetOnboardStore();
			window.location.href = `/block-editor/page/${ newSite.blogid }/home?is-gutenboarding`;
		}
	}, [ newSite, resetOnboardStore ] );

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
							className="gutenboarding__header-next-button"
							isPrimary
							isLarge
							onClick={ () =>
								currentUser ? handleCreateSite( currentUser.username ) : handleSignup()
							}
							disabled={ shouldCreate }
						>
							{ NO__( 'Create my site' ) }
						</Button>
					) }
				</div>
			</div>
			{ showSignupDialog && <SignupForm onRequestClose={ () => setShowSignupDialog( false ) } /> }
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Header;
