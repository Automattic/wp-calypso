import { JetpackFeaturePreview } from 'calypso/a8c-for-agencies/sections/sites/features/jetpack/jetpack-feature';
import { Site } from '../../../types';

import 'calypso/my-sites/scan/style.scss';
import './style.scss';

type Props = {
	site: Site;
};

export function JetpackScanPreview( { site }: Props ) {
	return <JetpackFeaturePreview site={ site } />;
}
