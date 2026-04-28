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
	const titleText = String(
		translate( '%(years)d years on WordPress.com', {
			args: { years: yearsOfService },
		} )
	);

	return (
		<div className={ clsx( 'years-of-service-badge', `is-${ size }` ) }>
			<div
				className="years-of-service-badge__circle"
				title={ size !== 'large' ? titleText : undefined }
			>
				{ yearsOfService }
			</div>
			{ size === 'large' && (
				<span className="years-of-service-badge__label">
					{ translate( 'Years on WordPress.com' ) }
				</span>
			) }
		</div>
	);
};
