import { createContext, useContext, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import wpcomRequest from 'wpcom-proxy-request';
import { useAgentsManagerContext } from '../contexts';
import { addSessionHandoff } from '../utils/session-handoff';
import { getSitePanelItem, type SitePanelItem } from '../utils/site-panel-content';
import { useSitePanelContent } from './use-site-panel-content';
import type { ReactNode } from 'react';

/** Coordinates cancellable editor opens so late responses cannot replace another page. */
function useSitePanelState() {
	const { site, siteKey, agentConfig, getTabSessionId } = useAgentsManagerContext();
	const { items, isError: isListError } = useSitePanelContent();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ frame, setFrame ] = useState< HTMLIFrameElement | null >( null );
	const [ url, setUrl ] = useState( '' );
	const [ externalUrl, setExternalUrl ] = useState( '' );
	const [ title, setTitle ] = useState( '' );
	const [ error, setError ] = useState( '' );
	const [ isLoading, setIsLoading ] = useState( false );
	const request = useRef< AbortController | null >( null );
	useEffect( () => () => request.current?.abort(), [] );

	const close = () => {
		request.current?.abort();
		setIsOpen( false );
		setUrl( '' );
		setExternalUrl( '' );
		setTitle( '' );
		setIsLoading( false );
		setError( '' );
	};
	const open = async ( item?: SitePanelItem ) => {
		setIsOpen( true );
		if ( ! item || ! site || ! agentConfig ) {
			return;
		}
		const validated = getSitePanelItem( item.url, site.URL || `https://${ site.domain }` );
		if ( ! validated ) {
			return;
		}
		request.current?.abort();
		const controller = new AbortController();
		request.current = controller;
		setIsLoading( true );
		setError( '' );
		setUrl( '' );
		setExternalUrl( '' );
		const referencedItem = items.find(
			( reference ) =>
				reference.url === item.url || ( item.postId && reference.postId === item.postId )
		);
		setTitle( item.hasTitle ? item.title : referencedItem?.title || item.title );
		try {
			const read = < T, >( path: string ): Promise< T > => {
				controller.signal.throwIfAborted();
				return wpcomRequest< T >( {
					path: `/sites/${ site.ID }${ path }`,
					apiVersion: '1.1',
					method: 'GET',
					signal: controller.signal,
				} );
			};
			const details = await read< {
				jetpack?: boolean;
				options: { admin_url: string; frame_nonce?: string; jetpack_frame_nonce?: string };
			} >(
				`?fields=ID,jetpack,options&options=admin_url,frame_nonce,jetpack_frame_nonce&_=${ Date.now() }`
			);
			let postId = validated.postId;
			if ( ! postId && ! validated.isSiteEditor ) {
				const path = new URL( validated.url ).pathname.replace( /\/$/, '' );
				const slug = decodeURIComponent( path.split( '/' ).pop() || '' );
				if ( ! slug ) {
					throw new Error( 'No post path.' );
				}
				const result = await read< { posts: { ID: number; URL: string }[] } >(
					`/posts/?slug=${ encodeURIComponent( slug ) }&type=any&status=any&number=100&fields=ID,URL`
				);
				postId = result.posts.find(
					( post ) => new URL( post.URL ).pathname.replace( /\/$/, '' ) === path
				)?.ID;
				if ( ! postId ) {
					throw new Error( 'No matching post.' );
				}
			}
			const editor = new URL(
				validated.isSiteEditor ? 'site-editor.php' : 'post.php',
				details.options.admin_url
			);
			if ( validated.isSiteEditor ) {
				editor.search = new URL( validated.url ).search;
			} else {
				editor.searchParams.set( 'post', String( postId ) );
				editor.searchParams.set( 'action', 'edit' );
			}
			if ( ! [ 'http:', 'https:' ].includes( editor.protocol ) ) {
				throw new Error( 'Invalid admin URL.' );
			}
			const handoff = addSessionHandoff( editor.href, getTabSessionId(), siteKey );
			if ( controller.signal.aborted ) {
				return;
			}
			setExternalUrl( handoff );
			if ( validated.isSiteEditor && details.jetpack ) {
				window.open( handoff, '_blank', 'noopener,noreferrer' );
				setError( __( 'Open the site editor in a new tab to continue.', __i18n_text_domain__ ) );
				return;
			}
			const nonce = details.jetpack
				? details.options.jetpack_frame_nonce
				: details.options.frame_nonce;
			if ( ! nonce ) {
				throw new Error( 'Missing frame nonce.' );
			}
			const embedded = new URL( handoff );
			embedded.searchParams.set( 'frame-nonce', nonce );
			embedded.searchParams.set( 'am-embedded', '1' );
			setUrl( embedded.href );
		} catch ( error ) {
			if ( ! controller.signal.aborted ) {
				// eslint-disable-next-line no-console
				console.error( '[AgentsManager] Could not open site panel page:', error );
				setError( __( 'Could not open this page. Please try again.', __i18n_text_domain__ ) );
			}
		} finally {
			if ( ! controller.signal.aborted ) {
				setIsLoading( false );
			}
		}
	};
	return {
		frame,
		setFrame,
		url,
		externalUrl,
		title,
		isOpen,
		isLoading,
		error,
		items,
		isListError,
		open,
		close,
	};
}

const SitePanelContext = createContext< ReturnType< typeof useSitePanelState > | null >( null );

export function SitePanelProvider( { children }: { children: ReactNode } ) {
	const panel = useSitePanelState();
	return <SitePanelContext.Provider value={ panel }>{ children }</SitePanelContext.Provider>;
}

/**
 * Owns the full-screen current-page panel. P2/P3 can attach a bridge to `frame`
 * and `url` here without changing the layout. The provider is keyed by site/session;
 * closing or switching sessions aborts pending opens and unmounts the iframe.
 */
export function useSitePanel() {
	const panel = useContext( SitePanelContext );
	if ( ! panel ) {
		throw new Error( 'SitePanelProvider is required.' );
	}
	return panel;
}
