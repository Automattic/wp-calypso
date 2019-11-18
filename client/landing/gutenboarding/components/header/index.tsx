/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Icon, IconButton, Popover } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import React, { useState } from 'react';
import shortcuts from '@wordpress/edit-post/build-module/keyboard-shortcuts';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import './style.scss';
import DomainPicker from '../domain-picker';

interface Props {
	isEditorSidebarOpened: boolean;
	toggleGeneralSidebar: () => void;
}

export default function Header( { isEditorSidebarOpened, toggleGeneralSidebar }: Props ) {
	const [ isDomainPopoverVisible, setDomainPopoverVisibility ] = useState(
		true /* @TODO: should be `false` by default, true for dev */
	);
	const { siteTitle, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<div className="gutenboarding__header-site">
				<Icon icon="wordpress-alt" color="#066188" />
				<span className="gutenboarding__header-site-heading">
					{ siteTitle ? siteTitle : NO__( 'Create your site' ) }
				</span>
				<Button onClick={ () => setDomainPopoverVisibility( s => ! s ) }>
					{ NO__( 'Pick a domain' ) }
					{ isDomainPopoverVisible && (
						<Popover
							/* Prevent interaction in the domain picker from affecting the popover */
							onClick={ e => e.stopPropagation() }
							onKeyDown={ e => e.stopPropagation() }
						>
							<DomainPicker />
						</Popover>
					) }
				</Button>
			</div>
			<div
				aria-label={ NO__( 'Document tools' ) }
				aria-orientation="horizontal"
				className="gutenboarding__header-toolbar"
				role="toolbar"
			></div>
			<div className="gutenboarding__header-actions">
				<Button isPrimary isLarge disabled={ isEmpty( siteVertical ) }>
					{ NO__( 'Next' ) }
				</Button>
				<IconButton
					icon="admin-generic"
					label={ NO__( 'Site block settings' ) }
					onClick={ toggleGeneralSidebar }
					isToggled={ isEditorSidebarOpened }
					aria-expanded={ isEditorSidebarOpened }
					shortcut={ shortcuts.toggleSidebar }
				/>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}
