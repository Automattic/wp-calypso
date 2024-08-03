import { CompactCard, Gridicon } from '@automattic/components';
import { useOpenArticleInHelpCenter } from '@automattic/help-center/src/hooks';
import { localizeUrl } from '@automattic/i18n-utils';
import React from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

import '../help-results/style.scss';

type HelpLink = {
	link: string;
	title: string;
	description: string;
	image: string;
	disabled?: boolean;
};

type HelpResultItemProps = {
	helpLink: HelpLink;
	onClick?: ( event: React.MouseEvent< HTMLAnchorElement >, helpLink: HelpLink ) => void;
	iconTypeDescription?: string;
	compact?: boolean;
	openInHelpCenter?: boolean;
};

const HelpResultItem = ( {
	helpLink,
	onClick,
	iconTypeDescription = 'book',
	compact,
	openInHelpCenter = false,
}: HelpResultItemProps ) => {
	const { openArticleInHelpCenter } = useOpenArticleInHelpCenter();
	const handleOnClick = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		if ( helpLink.disabled ) {
			return event.preventDefault();
		}

		onClick?.( event, helpLink );

		if ( helpLink.link && openInHelpCenter && openArticleInHelpCenter ) {
			event.preventDefault();
			openArticleInHelpCenter( helpLink.link );
		}
	};

	const getResultImage = () => {
		if ( ! helpLink.image ) {
			return;
		}

		return <img src={ helpLink.image } alt="" />;
	};

	const getResultIcon = () => {
		//If we've assigned an image, don't show the icon
		if ( helpLink.image ) {
			return;
		}

		// By rule, gridicons don't contain logos so we need a special case here
		if ( iconTypeDescription === 'jetpack' ) {
			return (
				<svg
					className="help-result__icon"
					height="24"
					width="24"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.39 12.335l-3.14-.8c-.798-.202-1.18-1.11-.77-1.822l3.91-6.773v9.395zm4.84-2.048l-3.91 6.773V9.665l3.14.8c.798.202 1.18 1.11.77 1.822z" />
				</svg>
			);
		}
		return <Gridicon className="help-result__icon" icon={ iconTypeDescription } size={ 24 } />;
	};

	return (
		<a
			className="help-result"
			href={ localizeUrl( helpLink.link ) }
			target="_blank"
			rel="noreferrer noopener"
			onClick={ handleOnClick }
		>
			<CompactCard className="help-result__wrapper">
				{ compact && getResultIcon() }
				<div className="help-result__content-wrapper">
					<h2 className="help-result__title">{ decodeEntities( helpLink.title ) }</h2>
					{ ! compact && (
						<p className="help-result__description">{ decodeEntities( helpLink.description ) }</p>
					) }
				</div>
				{ ! compact && (
					<div className="help-result__icon-wrapper">
						{ getResultImage() }
						{ getResultIcon() }
					</div>
				) }
			</CompactCard>
		</a>
	);
};

export default HelpResultItem;
