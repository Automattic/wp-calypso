import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import React, { useEffect, useState } from 'react';
import type { SupportContext, SupportContextData } from './types';
import type { HelpCenterDispatch } from '@automattic/data-stores';

const HELP_CENTER_STORE = 'automattic/help-center';

const InlineSupportLink = ( {
	className,
	title,
	supportPostId,
	supportLink,
	supportContext,
	children = __( 'Learn more' ),
	disabled = false,
	onClick,
}: {
	className?: string;
	title?: string;
	supportPostId?: number;
	supportLink?: string;
	supportContext?: string;
	children?: React.ReactNode;
	disabled?: boolean;
	onClick?: (
		event: React.SyntheticEvent< HTMLAnchorElement >,
		supportData: SupportContextData
	) => void;
} ) => {
	const [ supportData, setSupportData ] = useState( {
		link: supportLink,
		post_id: supportPostId,
		/** support.wordpress.com is the default blog used for support links */
		blog_id: 0,
	} );

	const { link, post_id, blog_id } = supportData;

	const openSupportDoc = async () => {
		// Load `@automattic/data-stores` asynchronously to avoid including it in the main bundle and reduce initial load size.
		if ( ! dispatch( HELP_CENTER_STORE ) ) {
			const { HelpCenter: HelpCenterStore } = await import( '@automattic/data-stores' );
			HelpCenterStore.register();
		}

		( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch[ 'dispatch' ] ).setShowSupportDoc(
			link,
			post_id,
			blog_id
		);
	};

	const handleClick = ( event: React.SyntheticEvent< HTMLAnchorElement > ) => {
		if ( disabled ) {
			return;
		}

		if ( post_id ) {
			event.preventDefault();
			openSupportDoc();
		}

		onClick?.( event, supportData );
	};

	const linkProps = {
		className: className,
		href: post_id ? localizeUrl( link ) : link,
		title,
		onClick: handleClick,
	};

	// Lazy load the supportPostId and supportLink by supportContext if not provided.
	useEffect( () => {
		const loadSupportDataByContext = async ( context: string ) => {
			const { default: contextLinks } = await import( './context-links' );
			const supportDataFromContext = ( contextLinks as SupportContext )[ context ];
			if ( supportDataFromContext ) {
				setSupportData( supportDataFromContext );
			}
		};

		if ( supportContext && ! post_id && ! link ) {
			loadSupportDataByContext( supportContext );
		}
	}, [ setSupportData ] );

	if ( ! post_id && ! link ) {
		return null;
	}

	if ( post_id ) {
		return (
			<a { ...linkProps } target="_blank" rel="noopener noreferrer">
				{ children }
			</a>
		);
	}

	return <ExternalLink { ...linkProps }>{ children }</ExternalLink>;
};

export default InlineSupportLink;
