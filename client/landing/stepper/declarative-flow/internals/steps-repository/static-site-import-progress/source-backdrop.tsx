import { MShotsImage } from '@automattic/onboarding';
import { addSchemeIfMissing } from 'calypso/lib/url';
import { mShotConfigs } from '../site-migration-instructions/site-preview/hooks/use-site-preview-mshot-image-handler';

// The size the address step already asked mShots to capture the source at, so it's ready sooner.
const BACKDROP_OPTIONS = mShotConfigs.desktop;

/** The source's homepage, faded and blurred behind the whole step. */
export function SourceBackdrop( { from }: { from?: string } ) {
	if ( ! from ) {
		return null;
	}
	return (
		<div className="static-site-import-progress-step__backdrop" aria-hidden>
			<MShotsImage
				url={ addSchemeIfMissing( from, 'https' ) }
				alt=""
				aria-labelledby=""
				options={ BACKDROP_OPTIONS }
				loading="eager"
			/>
		</div>
	);
}
