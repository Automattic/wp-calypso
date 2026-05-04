import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { getUserProfileUrl } from 'calypso/reader/user-profile/user-profile.utils';

import './style.scss';

interface YearsOfServiceBadgeProps {
	size: 'large' | 'medium' | 'small';
	yearsOfService: number;
	linked?: boolean;
	userLogin?: string;
}

export const YearsOfServiceBadge = ( {
	size,
	yearsOfService,
	linked,
	userLogin,
}: YearsOfServiceBadgeProps ): JSX.Element => {
	const translate = useTranslate();
	const description = String(
		translate( '%(years)d year on WordPress.com', '%(years)d years on WordPress.com', {
			count: yearsOfService,
			args: { years: yearsOfService },
		} )
	);

	const className = clsx( 'years-of-service-badge', `is-${ size }` );
	const content = (
		<>
			<div
				className="years-of-service-badge__circle"
				title={ size !== 'large' ? description : undefined }
				aria-label={ size !== 'large' ? description : undefined }
			>
				{ yearsOfService }
			</div>
			{ size === 'large' && (
				<span className="years-of-service-badge__label">
					{ translate( 'Year on WordPress.com', 'Years on WordPress.com', {
						count: yearsOfService,
					} ) }
				</span>
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
