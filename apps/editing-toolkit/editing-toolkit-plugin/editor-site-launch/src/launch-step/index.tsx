import * as React from 'react';

import './styles.scss';

export interface Props {
	onPrevStep?: () => void;
	onNextStep?: () => void;
}

const LaunchStep: React.FunctionComponent< Props > = ( { children } ) => {
	return <>{ children }</>;
};

export default LaunchStep;
