import { Button, IconType } from '@wordpress/components';
import { ReactNode } from 'react';
import { Badge } from 'calypso/performance-profiler/components/badge';

import './style.scss';

type Props = {
	title: string;
	message: string | ReactNode;
	ctaText: string;
	ctaHref: string;
	secondaryMessage?: string;
	displayBadge?: boolean;
	ctaIcon?: string;
};

export const MessageDisplay = ( {
	displayBadge = false,
	title,
	message,
	ctaText,
	ctaHref,
	secondaryMessage,
	ctaIcon = '',
}: Props ) => {
	return (
		<div className="message-display">
			<div className="l-block-wrapper">
				<div className="message-wrapper">
					{ displayBadge && <Badge /> }
					<h1 className="title">{ title }</h1>
					<p className="message">{ message }</p>
					<Button
						variant="primary"
						icon={ ctaIcon as IconType }
						className="cta-button"
						href={ ctaHref }
					>
						{ ctaText }
					</Button>
					{ secondaryMessage && <p className="secondary-message">{ secondaryMessage }</p> }
				</div>
			</div>
		</div>
	);
};
