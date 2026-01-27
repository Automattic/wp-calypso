import { isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import type { BrandHeaderProps } from './types';

import './style.scss';

/**
 * Brand header with logo, title, and optional description
 * @example
 * <BrandHeader
 *   logo="/path/to/logo.svg"
 *   logoAlt="Company Logo"
 *   logoWidth={72}
 *   logoHeight={24}
 *   title="Join the team"
 *   description="You've been invited to collaborate"
 * />
 * @example
 * <BrandHeader
 *   logo={<CustomLogoComponent />}
 *   title="Connect your account"
 * />
 */
export function BrandHeader( {
	logo,
	logoAlt = '',
	logoWidth,
	logoHeight,
	title,
	description,
	className,
}: BrandHeaderProps ): JSX.Element {
	const renderLogo = () => {
		if ( ! logo ) {
			return null;
		}

		if ( isValidElement( logo ) ) {
			return <div className="connect-screen-brand-header__logo">{ logo }</div>;
		}

		if ( typeof logo === 'string' ) {
			return (
				<div className="connect-screen-brand-header__logo">
					<img
						src={ logo }
						alt={ logoAlt }
						width={ logoWidth }
						height={ logoHeight }
						className="connect-screen-brand-header__logo-image"
					/>
				</div>
			);
		}

		return null;
	};

	return (
		<div className={ clsx( 'connect-screen-brand-header', className ) }>
			{ renderLogo() }
			<h1 className="connect-screen-brand-header__title">{ title }</h1>
			{ description && <p className="connect-screen-brand-header__description">{ description }</p> }
		</div>
	);
}
