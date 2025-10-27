import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import React from 'react';
import useSupportDocData from './use-support-doc-data';
import type { SupportDocData } from './types';

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

	const handleClick = ( event: React.SyntheticEvent< HTMLAnchorElement > ) => {
		if ( supportDocData?.postId ) {
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

	return <ExternalLink { ...linkProps }>{ children }</ExternalLink>;
};

export default InlineSupportLink;
