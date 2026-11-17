import { useTranslate } from 'i18n-calypso';
import './style.scss';

/**
 * The pitch beside the account form in the theme grid layout. `isCompact` is the strip shown above
 * the form on smaller screens, where the copy is dropped to keep the form above the fold.
 */
export const SignupThemeGrid = ( { isCompact = false }: { isCompact?: boolean } ) => {
	const translate = useTranslate();

	if ( isCompact ) {
		return <div className="signup-theme-grid signup-theme-grid--compact" aria-hidden="true" />;
	}

	return (
		<div className="signup-theme-grid">
			<div className="signup-theme-grid__content">
				<div className="signup-theme-grid__image" aria-hidden="true" />
				<p className="signup-theme-grid__headline">
					{ translate( 'Turn your idea into a real website' ) }
				</p>
				<p className="signup-theme-grid__description">
					{ translate(
						'WordPress powers 39.5% of the web. No coding needed: pick a design, make it yours, and publish. Start for free.'
					) }
				</p>
			</div>
		</div>
	);
};
