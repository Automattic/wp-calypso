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
 * group or a single tool; a matching location hash opens the card and scrolls
 * the target into view.
 */
export default function McpGroupCard( {
	id,
	title,
	description,
	toolAnchors = [],
	allEnabled,
	onEnableAll,
	disabled,
	children,
}: {
	id: string;
	title: string;
	description?: string;
	toolAnchors?: string[];
	allEnabled: boolean;
	onEnableAll: ( enabled: boolean ) => void;
	disabled?: boolean;
	children?: ReactNode;
} ) {
	const initialHash = useRef( '' );
	if ( initialHash.current === '' && typeof window !== 'undefined' ) {
		initialHash.current = window.location.hash.replace( /^#/, '' );
	}
	const [ isOpen, setIsOpen ] = useState( () => {
		const hash = initialHash.current;
		return hash === id || hash.startsWith( `${ id }/` ) || toolAnchors.includes( hash );
	} );

	useEffect( () => {
		if ( isOpen && initialHash.current ) {
			// jsdom has no scrollIntoView, hence the optional call.
			document.getElementById( initialHash.current )?.scrollIntoView?.( { block: 'start' } );
		}
		// Anchor expansion happens once, on mount.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

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
							icon={ isOpen ? chevronUp : chevronDown }
							label={ isOpen ? __( 'Hide operations' ) : __( 'Show operations' ) }
							aria-expanded={ isOpen }
							onClick={ () => setIsOpen( ! isOpen ) }
						/>
					) }
				</HStack>
			</CardBody>
			{ isOpen && children != null && (
				<>
					<CardDivider className="mcp-settings__sub-divider" />
					<CardBody>{ children }</CardBody>
				</>
			) }
		</Card>
	);
}
