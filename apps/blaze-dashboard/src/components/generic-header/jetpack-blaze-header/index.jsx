import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const JetpackIcon = () => (
	<svg
		className="jetpack-blaze-header__icon"
		width="24"
		height="24"
		viewBox="0 0 32 32"
		fill="none"
		aria-hidden="true"
	>
		<path
			d="M16.0006 32C24.8374 32 32.0012 24.8362 32.0012 15.9994C32.0012 7.16259 24.8374 0 16.0006 0C7.16377 0 0 7.16377 0 16.0006C0 24.8374 7.16377 32 16.0006 32Z"
			fill="#069E08"
		/>
		<path d="M16.7944 13.3132V28.8245L24.7947 13.3132H16.7944Z" fill="white" />
		<path d="M15.1765 18.6572V3.17554L7.20703 18.6572H15.1765Z" fill="white" />
	</svg>
);

const JetpackBlazeHeader = ( {
	className = '',
	subHeaderText,
	brandFont = false,
	align = 'left',
	children,
} ) => {
	const translate = useTranslate();

	return (
		<header
			className={ clsx( 'jetpack-blaze-header formatted-header', className, {
				'is-left-align': align === 'left',
				'is-right-align': align === 'right',
				'is-without-subhead': ! subHeaderText,
			} ) }
		>
			<div>
				<div className="jetpack-blaze-header__title-row">
					<JetpackIcon />
					<h1
						className={ clsx( 'formatted-header__title', 'jetpack-blaze-header__title', {
							'wp-brand-font': brandFont,
						} ) }
					>
						{ translate( 'Blaze' ) }
					</h1>
				</div>
				{ subHeaderText && (
					<p className="formatted-header__subtitle jetpack-blaze-header__subtitle">
						{ subHeaderText }
					</p>
				) }
			</div>
			{ children }
		</header>
	);
};

export default JetpackBlazeHeader;
