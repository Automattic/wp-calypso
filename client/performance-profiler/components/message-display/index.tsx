import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button, IconType } from '@wordpress/components';
import clsx from 'clsx';
import { ReactNode } from 'react';
import { Badge } from 'calypso/performance-profiler/components/badge';

import './style.scss';

type Props = {
	title?: string;
	message: string | ReactNode;
	ctaText?: string;
	ctaHref?: string;
	secondaryMessage?: string;
	displayBadge?: boolean;
	ctaIcon?: string;
	isErrorMessage?: boolean;
};

export const ErrorSecondLine = styled.span`
	color: var( --studio-red-5 );
	font-weight: 400;
	line-height: 20px;
`;

export const MessageDisplay = ( {
	displayBadge = false,
	title,
	message,
	ctaText,
	ctaHref,
	secondaryMessage,
	ctaIcon = '',
	isErrorMessage = false,
}: Props ) => {
	return (
		<div className="message-display">
			<div className="l-block-wrapper">
				<div className="message-wrapper">
					{ displayBadge && <Badge /> }
					<div className={ clsx( 'main-message', { error: isErrorMessage } ) }>
						{ isErrorMessage && <Gridicon icon="notice-outline" /> }
						{ title && <h1 className="title">{ title }</h1> }
						<p className="message">{ message }</p>
						{ ctaText && ctaHref && (
							<Button
								variant="primary"
								icon={ ctaIcon as IconType }
								className="cta-button"
								href={ ctaHref }
							>
								{ ctaText }
							</Button>
						) }
					</div>
					{ secondaryMessage && <p className="secondary-message">{ secondaryMessage }</p> }
				</div>
			</div>
		</div>
	);
};
