import { JetpackFeaturePreview } from 'calypso/a8c-for-agencies/sections/sites/features/jetpack/jetpack-feature';
import { Site } from '../../../types';

import './style.scss';

type Props = {
	site: Site;
};

export function JetpackBackupPreview( { site }: Props ) {
	return <JetpackFeaturePreview site={ site } />;
}
