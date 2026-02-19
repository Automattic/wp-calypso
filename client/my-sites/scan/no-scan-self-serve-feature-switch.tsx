import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { FunctionComponent, ReactNode } from 'react';
import NoFeatureSwitch from 'calypso/components/jetpack/no-feature-switch';

type Props = {
	trueComponent: ReactNode;
	falseComponent: ReactNode;
	loadingComponent?: ReactNode;
};

const NoScanSelfServeFeatureSwitch: FunctionComponent< Props > = ( props ) => (
	<NoFeatureSwitch feature={ WPCOM_FEATURES_SCAN_SELF_SERVE } { ...props } />
);

export default NoScanSelfServeFeatureSwitch;
