import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface YearsOfServiceBadgeProps {
	size: 'large' | 'medium' | 'small';
	yearsOfService: number;
}

export const YearsOfServiceBadge = ( {
	size,
	yearsOfService,
}: YearsOfServiceBadgeProps ): JSX.Element => {
	const translate = useTranslate();
	const description = String(
		translate( '%(years)d year on WordPress.com', '%(years)d years on WordPress.com', {
			count: yearsOfService,
			args: { years: yearsOfService },
		} )
	);

	return (
		<div className={ clsx( 'years-of-service-badge', `is-${ size }` ) }>
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
		</div>
	);
};
