import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon, arrowRight, globe } from '@wordpress/icons';
import ImporterLogo from 'calypso/my-sites/importer/importer-logo';

/** The platforms ImporterLogo has a logo for, among those the static import takes. */
const PLATFORMS_WITH_LOGO = [ 'squarespace', 'wix' ];

/** The source's platform, then WordPress.com: where the site is coming from and going to. */
export function MoveLogos( { platform }: { platform?: string } ) {
	return (
		<HStack
			className="static-site-import-progress-step__logos"
			justify="center"
			spacing={ 4 }
			// Decorative: the heading already says where the site is going.
			aria-hidden
		>
			<span className="static-site-import-progress-step__logo">
				{ platform && PLATFORMS_WITH_LOGO.includes( platform ) ? (
					<ImporterLogo icon={ platform } />
				) : (
					<Icon className="static-site-import-progress-step__logo-fallback" icon={ globe } />
				) }
			</span>
			<Icon className="static-site-import-progress-step__arrow" icon={ arrowRight } />
			<span className="static-site-import-progress-step__logo">
				<ImporterLogo icon="wordpress" />
			</span>
		</HStack>
	);
}
