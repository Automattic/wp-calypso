import { localizeUrl } from '@automattic/i18n-utils';
import { dispatch } from '@wordpress/data';
import { useEffect, useState } from 'react';
import type { ContextLinks, SupportDocData } from './types';
import type { HelpCenterDispatch } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';
declare global {
	interface Window {
		wp: undefined | Record< string, any >;
	}
}

declare const configData: {
	blog_id: number;
	initial_state: {
		sites: {
			items: Record< number, { jetpack: boolean; options: { is_wpcom_atomic: boolean } } >;
		};
	};
};

/**
 * This code is one of the *fun* codes that run in many many places (Calypso client, Dashboard v2, wp-admin, wp-admin Atomic, wp-admin Jetpack).
 * Each of these places has different ways to manage their state. So we cannot use a simple selector to check if the site is Jetpack (thus doesn't have the Help Center).
 * So I hacked around this by checking the configData object, which is available in all the places.
 */
const site =
	typeof configData !== 'undefined' &&
	configData?.initial_state?.sites?.items[ configData.blog_id ];
const helpCenterUnavailable = site && site?.jetpack && ! site?.options?.is_wpcom_atomic;

const loadHelpCenterDispatch = async () => {
	// Check if the help center store is already loaded in the window object.
	if ( typeof window !== 'undefined' && window.wp?.data?.dispatch?.( HELP_CENTER_STORE ) ) {
		return window.wp.data.dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ];
	}

	// Load `@automattic/data-stores` asynchronously to avoid including it in the main bundle and reduce initial load size.
	if ( ! dispatch( HELP_CENTER_STORE ) ) {
		const { HelpCenter: HelpCenterStore } = await import(
			/* webpackChunkName: "async-load-automattic-data-stores" */ '@automattic/data-stores'
		);
		HelpCenterStore.register();
	}

	return dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ];
};

const useSupportDocData = ( {
	supportPostId = 0,
	supportLink = '',
	supportContext,
}: {
	supportPostId?: number;
	supportLink?: string;
	supportContext?: string;
} ): {
	supportDocData: SupportDocData | null;
	openSupportDoc: () => Promise< void > | void;
} => {
	const [ supportDocData, setSupportDocData ] = useState< SupportDocData >( {
		link: supportLink ? localizeUrl( supportLink ) : supportLink,
		postId: supportPostId,
		blogId: 0, // support.wordpress.com is the default blog used for support links
	} );

	// Lazy load the supportPostId and supportLink by supportContext if not provided.
	const shouldLoadSupportDocData = supportContext && ! supportPostId && ! supportLink;

	const [ isLoading, setIsLoading ] = useState( shouldLoadSupportDocData );

	const openSupportDoc = async () => {
		// The Help Center doesn't work in Jetpack sites, so we open the link in a new tab.
		if ( helpCenterUnavailable ) {
			window.open( supportDocData.link, '_blank' );
			return;
		}

		// Load `@automattic/data-stores` asynchronously to avoid including it in the main bundle and reduce initial load size.
		const { setShowSupportDoc } = await loadHelpCenterDispatch();
		setShowSupportDoc( supportDocData.link, supportDocData.postId, supportDocData.blogId );
	};

	useEffect( () => {
		const loadSupportDocDataByContext = async ( context: string ) => {
			const { default: contextLinks } = await import(
				/* webpackChunkName: "async-load-context-links" */ './context-links'
			);
			const supportDocDataFromContext = ( contextLinks as ContextLinks )[ context ];
			if ( ! supportDocDataFromContext ) {
				console.error( `The support doc data cannot be found by the given context: ${ context }.` ); // eslint-disable-line no-console
				return;
			}

			const { link, post_id, blog_id } = supportDocDataFromContext;
			setSupportDocData( {
				link: post_id ? localizeUrl( link ) : link,
				postId: post_id,
				blogId: blog_id,
			} );

			setIsLoading( false );
		};

		if ( shouldLoadSupportDocData ) {
			loadSupportDocDataByContext( supportContext );
		}
	}, [ shouldLoadSupportDocData, supportContext, setSupportDocData ] );

	return {
		supportDocData: ! isLoading ? supportDocData : null,
		openSupportDoc,
	};
};

export default useSupportDocData;
