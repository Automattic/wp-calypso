import { Button } from '@wordpress/components';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ThemeSectionHeaderProps {
	title: string;
	subtitle: TranslateResult;
	buttonLabel?: string;
	buttonHref?: string;
	onButtonClick?: () => void;
}

export default function ThemeSectionHeader( {
	title,
	subtitle,
	buttonLabel,
	buttonHref,
	onButtonClick,
}: ThemeSectionHeaderProps ) {
	return (
		<div className="theme-section-header">
			<div className="theme-section-header__headings">
				<h2 className="theme-section-header__title">{ title }</h2>
				<p className="theme-section-header__subtitle">{ subtitle }</p>
			</div>
			{ !! buttonLabel && ( buttonHref || onButtonClick ) && (
				<Button
					className="theme-section-header__button"
					variant="secondary"
					href={ buttonHref }
					onClick={ onButtonClick }
				>
					{ buttonLabel }
				</Button>
			) }
		</div>
	);
}
