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
}: {
	className?: string;
	title?: string;
	supportPostId?: number;
	supportLink?: string;
	supportContext?: string;
	children?: React.ReactNode;
	onClick?: ( supportData: SupportDocData | null ) => void;
} ) => {
	const { supportDocData, openSupportDoc } = useSupportDocData( {
		supportPostId,
		supportLink,
		supportContext,
	} );

	const { postId, link } = supportDocData || {};

	const handleClick = ( event: React.SyntheticEvent< HTMLAnchorElement > ) => {
		if ( postId ) {
			event.preventDefault();
			openSupportDoc();
		}

		onClick?.( supportDocData );
	};

	const linkProps = {
		className: className,
		href: link ?? '#',
		title,
		onClick: handleClick,
	};

	if ( ! postId && ! link ) {
		return null;
	}

	if ( postId ) {
		return (
			<a { ...linkProps } target="_blank" rel="noopener noreferrer">
				{ children }
			</a>
		);
	}

	return <ExternalLink { ...linkProps }>{ children }</ExternalLink>;
};

export default InlineSupportLink;
