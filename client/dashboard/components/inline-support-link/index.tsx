import { __ } from '@wordpress/i18n';
import { Link } from '@wordpress/ui';
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

	if ( opensInPanel ) {
		return <Link { ...linkProps }>{ children }</Link>;
	}

	return (
		<Link { ...linkProps } openInNewTab>
			{ children }
		</Link>
	);
};

export default InlineSupportLink;
