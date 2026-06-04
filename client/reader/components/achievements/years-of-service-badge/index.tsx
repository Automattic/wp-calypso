import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';
import type { JSX } from 'react';

import './style.scss';

interface YearsOfServiceBadgeProps {
	size: 'large' | 'achievement-card' | 'medium' | 'small';
	yearsOfService: number;
	linked?: boolean;
	userLogin?: string;
	label?: string;
}

export const YearsOfServiceBadge = ( {
	size,
	yearsOfService,
	linked,
	userLogin,
	label,
}: YearsOfServiceBadgeProps ): JSX.Element => {
	const translate = useTranslate();
	const description = String(
		translate( '%(years)d year on WordPress.com', '%(years)d years on WordPress.com', {
			count: yearsOfService,
			args: { years: yearsOfService },
		} )
	);
	const resolvedLabel =
		label ??
		translate( 'Year on WordPress.com', 'Years on WordPress.com', {
			count: yearsOfService,
		} );

	const className = clsx( 'years-of-service-badge', `is-${ size }` );
	const isInlineSize = size === 'medium' || size === 'small';
	const content = (
		<>
			<div
				className="years-of-service-badge__circle"
				title={ isInlineSize ? description : undefined }
				aria-label={ isInlineSize ? description : undefined }
			>
				{ yearsOfService }
			</div>
			{ size === 'large' && resolvedLabel && (
				<span className="years-of-service-badge__label">{ resolvedLabel }</span>
			) }
		</>
	);

	if ( linked && userLogin ) {
		return (
			<a
				className={ className }
				href={ `${ getUserProfileUrl( userLogin ) }/achievements` }
				aria-label={ translate( 'View achievements' ) }
			>
				{ content }
			</a>
		);
	}

	return <div className={ className }>{ content }</div>;
};
