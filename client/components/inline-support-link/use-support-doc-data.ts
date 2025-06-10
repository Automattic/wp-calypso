import { localizeUrl } from '@automattic/i18n-utils';
import { dispatch } from '@wordpress/data';
import { useEffect, useState } from 'react';
import type { ContextLinks, SupportDocData } from './types';
import type { HelpCenterDispatch } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';

const loadHelpCenterDispatch = async () => {
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
