import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
import useSupportDocData from 'calypso/components/inline-support-link/use-support-doc-data'; // eslint-disable-line no-restricted-imports
import type { SupportDocData } from 'calypso/components/inline-support-link/types'; // eslint-disable-line no-restricted-imports

const InlineSupportLink = ( {
	className,
	title,
	supportPostId,
	supportLink,
	supportContext,
	children = __( 'Learn more' ),
	onClick,
	forceOpenInHelpCenter = false,
}: {
	className?: string;
	title?: string;
	supportPostId?: number;
	supportLink?: string;
	supportContext?: string;
	children?: React.ReactNode;
	onClick?: ( supportData: SupportDocData | null ) => void;
	forceOpenInHelpCenter?: boolean;
} ) => {
	const { supportDocData, openSupportDoc } = useSupportDocData( {
		supportPostId,
		supportLink,
		supportContext,
	} );

	const opensInPanel = !! supportDocData?.postId || forceOpenInHelpCenter;

	const handleClick = ( event: React.SyntheticEvent< HTMLAnchorElement > ) => {
		if ( opensInPanel ) {
			event.preventDefault();
			openSupportDoc();
		}

		onClick?.( supportDocData );
	};

	if ( ! supportDocData?.postId && ! supportDocData?.link ) {
		return null;
	}

	const linkProps = {
		className: className,
		href: supportDocData.link,
		title,
		onClick: handleClick,
	};

	if ( supportDocData?.postId ) {
		return (
			<a { ...linkProps } target="_blank" rel="noopener noreferrer">
				{ children }
			</a>
		);
	}

	if ( forceOpenInHelpCenter ) {
		return <a { ...linkProps }>{ children }</a>;
	}

	return <ExternalLink { ...linkProps }>{ children }</ExternalLink>;
};

export default InlineSupportLink;
