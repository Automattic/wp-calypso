/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Icon, IconButton } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import './style.scss';
import { DomainName } from '../../stores/domain-suggestions/types';
import { DomainPickerButton } from '../domain-picker';
import { isFilledFormValue } from '../../stores/onboard/types';
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
	const [ domainText, setDomainText ] = useState< DomainName >( '' );

	const { domain, siteTitle, siteVertical } = useSelect( select =>
		select( ONBOARD_STORE ).getState()
	);

	const [ domainSearch ] = useDebounce(
		// eslint-disable-next-line no-nested-ternary
		domain // If we know a domain, do not search.
			? null
			: isFilledFormValue( siteTitle ) // If we have a siteTitle, use it.
			? siteTitle
			: // Otherwise, do not search.
			  null,
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
				...( isFilledFormValue( siteVertical ) && { vertical: siteVertical.id } ),
			} )?.[ 0 ];
		},
		[ domainSearch, siteVertical ]
	);

	// Update domainText only when we have a replacement.
	useEffect( () => {
		setDomainText( current => domain ?? freeDomainSuggestion?.domain_name ?? current );
	}, [ domain, freeDomainSuggestion ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
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
					<div className="gutenboarding__site-title">
						{ siteTitle ? siteTitle : NO__( 'Create your site' ) }
					</div>
					{ domainText && (
						<DomainPickerButton
							defaultQuery={ isFilledFormValue( siteTitle ) ? siteTitle : undefined }
							queryParameters={
								isFilledFormValue( siteVertical ) ? { vertical: siteVertical.id } : undefined
							}
						>
							{ domainText }
						</DomainPickerButton>
					) }
				</div>
			</div>
			<div className="gutenboarding__header-section">
				<div className="gutenboarding__header-group">
					<Button
						isPrimary
						isLarge
						disabled={ isFilledFormValue( siteVertical ) || ! siteVertical }
					>
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
