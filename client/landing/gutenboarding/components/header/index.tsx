/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Icon, IconButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import './style.scss';
import { DomainPickerButton } from '../domain-picker';
import { selectorDebounce } from '../../constants';

interface Props {
	isEditorSidebarOpened: boolean;
	toggleGeneralSidebar: () => void;
	toggleSidebarShortcut: KeyboardShortcut;
}

interface KeyboardShortcut {
	raw: string;
	display: string;
	ariaLabel: string;
}

const Header: FunctionComponent< Props > = ( {
	isEditorSidebarOpened,
	toggleGeneralSidebar,
	toggleSidebarShortcut,
} ) => {
	const { domain, siteTitle, siteVertical } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);
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
			return select( DOMAIN_STORE ).getDomainSuggestions( domainSearch, {
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

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<div className="gutenboarding__header-section">
				<div className="gutenboarding__header-group">
					<Icon icon="wordpress-alt" color="#066188" />
				</div>
				<div className="gutenboarding__header-group">
					{ currentDomain ? (
						<DomainPickerButton
							className="gutenboarding__header-domain-picker-button"
							defaultQuery={ siteTitle }
							onDomainSelect={ setDomain }
							queryParameters={ { vertical: siteVertical?.id } }
						>
							{ siteTitleElement }
							<span>{ currentDomain.domain_name }</span>
						</DomainPickerButton>
					) : (
						siteTitleElement
					) }
				</div>
			</div>
			<div className="gutenboarding__header-section">
				<div className="gutenboarding__header-group">
					<Button isPrimary isLarge disabled={ ! siteTitle }>
						{ NO__( 'Next' ) }
					</Button>
				</div>
				<div className="gutenboarding__header-group">
					<IconButton
						aria-expanded={ isEditorSidebarOpened }
						aria-haspopup="menu"
						aria-pressed={ isEditorSidebarOpened }
						icon="admin-generic"
						isToggled={ isEditorSidebarOpened }
						label={ NO__( 'Site block settings' ) }
						onClick={ toggleGeneralSidebar }
						shortcut={ toggleSidebarShortcut }
					/>
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

export default Header;
