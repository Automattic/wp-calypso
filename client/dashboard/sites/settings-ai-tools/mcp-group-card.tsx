import { useLocation } from '@tanstack/react-router';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronDown, chevronUp } from '@wordpress/icons';
import { useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardDivider } from '../../components/card';
import type { ReactNode } from 'react';

/**
 * A collapsible group card for MCP tool settings, mirroring the account-level
 * /me/preferences/mcp pages: collapsed by default, with a group intent toggle
 * and a chevron that reveals the tools. `id` anchors the card itself and
 * `toolAnchors` the rows inside it, so a server response can deep-link a
 * group or a single tool: whenever the location hash matches, the card opens
 * and the target scrolls into view.
 */
export default function McpGroupCard( {
	id,
	title,
	description,
	toolAnchors = [],
	allEnabled,
	onEnableAll,
	disabled,
	forceOpen = false,
	children,
}: {
	id: string;
	title: string;
	description?: string;
	toolAnchors?: string[];
	allEnabled: boolean;
	onEnableAll: ( enabled: boolean ) => void;
	disabled?: boolean;
	/** Renders the tools open regardless of the collapsed state (e.g. while searching). */
	forceOpen?: boolean;
	children?: ReactNode;
} ) {
	const location = useLocation();
	const hash = ( location.hash ?? '' ).replace( /^#/, '' );
	const [ isOpen, setIsOpen ] = useState( false );
	const open = isOpen || forceOpen;
	// Auto-open once per matching hash value, so a manual collapse afterwards
	// isn't fought, but a fresh anchor link opens the card again.
	const handledHash = useRef( '' );

	useEffect( () => {
		const matches = hash === id || hash.startsWith( `${ id }/` ) || toolAnchors.includes( hash );
		if ( hash && matches && handledHash.current !== hash ) {
			handledHash.current = hash;
			setIsOpen( true );
			// jsdom has no scrollIntoView, hence the optional call.
			document.getElementById( hash )?.scrollIntoView?.( { block: 'start' } );
		}
	}, [ hash, id, toolAnchors ] );

	return (
		<Card id={ id }>
			<CardBody>
				<HStack justify="space-between" alignment="center" spacing={ 4 }>
					<VStack spacing={ 1 } style={ { flex: 1, minWidth: 0 } }>
						<Heading level={ 3 } weight={ 600 } size={ 14 }>
							{ title }
						</Heading>
						{ description && (
							<Text truncate variant="muted" size={ 12 }>
								{ description }
							</Text>
						) }
					</VStack>
					<ToggleControl
						__nextHasNoMarginBottom
						checked={ allEnabled }
						disabled={ disabled }
						label={ __( 'Enable all' ) }
						onChange={ onEnableAll }
					/>
					{ children != null && (
						<Button
							icon={ open ? chevronUp : chevronDown }
							label={ open ? __( 'Hide operations' ) : __( 'Show operations' ) }
							aria-expanded={ open }
							onClick={ () => setIsOpen( ! isOpen ) }
						/>
					) }
				</HStack>
			</CardBody>
			{ open && children != null && (
				<>
					<CardDivider className="mcp-settings__sub-divider" />
					<CardBody>{ children }</CardBody>
				</>
			) }
		</Card>
	);
}
