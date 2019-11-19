/**
 * External dependencies
 */
import { __ as NO__ } from '@wordpress/i18n';
import { Button, Icon, IconButton } from '@wordpress/components';
import { rawShortcut, displayShortcut, shortcutAriaLabel } from '@wordpress/keycodes';
import { useSelect } from '@wordpress/data';
import React, { FunctionComponent } from 'react';
import { isEmpty } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import './style.scss';
import { DomainPickerButton } from '../domain-picker';

// Copied from https://github.com/WordPress/gutenberg/blob/c7d00c64a4c74236a4aab528b3987811ab928deb/packages/edit-post/src/keyboard-shortcuts.js#L11-L15
// to be consistent with Gutenberg's shortcuts, and in order to avoid pulling in all of `@wordpress/edit-post`.
const toggleSidebarShortcut = {
	raw: rawShortcut.primaryShift( ',' ),
	display: displayShortcut.primaryShift( ',' ),
	ariaLabel: shortcutAriaLabel.primaryShift( ',' ),
};

interface Props {
	isEditorSidebarOpened: boolean;
	toggleGeneralSidebar: () => void;
}

export default function Header( { isEditorSidebarOpened, toggleGeneralSidebar }: Props ) {
	const { siteTitle, siteVertical } = useSelect( select => select( STORE_KEY ).getState() );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ NO__( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<HeaderSection>
				<HeaderGroup>
					<Icon icon="wordpress-alt" color="#066188" />
				</HeaderGroup>
				<HeaderGroup>
					<div className="gutenboarding__site-title">
						{ siteTitle ? siteTitle : NO__( 'Create your site' ) }
					</div>
					<DomainPickerButton />
				</HeaderGroup>
			</HeaderSection>
			<HeaderSection>
				<HeaderGroup>
					<Button isPrimary isLarge disabled={ isEmpty( siteVertical ) }>
						{ NO__( 'Next' ) }
					</Button>
				</HeaderGroup>
				<HeaderGroup>
					<IconButton
						icon="admin-generic"
						label={ NO__( 'Site block settings' ) }
						onClick={ toggleGeneralSidebar }
						isToggled={ isEditorSidebarOpened }
						aria-expanded={ isEditorSidebarOpened }
						shortcut={ toggleSidebarShortcut }
					/>
				</HeaderGroup>
			</HeaderSection>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

const HeaderGroup: FunctionComponent< { className?: string } > = ( { children, className } ) => (
	<div className={ classnames( 'gutenboarding__header-group', className ) }>{ children }</div>
);
const HeaderSection: FunctionComponent< { className?: string } > = ( { children, className } ) => (
	<div className={ classnames( 'gutenboarding__header-section', className ) }>{ children }</div>
);
