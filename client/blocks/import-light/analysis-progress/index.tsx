import { ProgressBar } from '@automattic/components';
import { Title, Progress } from '@automattic/onboarding';
import type * as React from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	percentage: number;
	children?: React.ReactNode;
}
const AnalysisProgress: React.FunctionComponent< Props > = ( props ) => {
	const { percentage, children } = props;

	const elements = ( Array.isArray( children ) ? children : [ children ] ).filter( ( x ) => x );
	const titleEl = elements[ 0 ].type === Title ? elements[ 0 ] : undefined;
	const otherEl = titleEl ? elements.slice( 1 ) : elements;

	return (
		<div className="import-layout__center import-light__progress">
			<div className="import__heading-center">
				<Progress>
					{ titleEl }
					{ percentage && <ProgressBar value={ percentage } compact /> }
					{ otherEl }
				</Progress>
			</div>
		</div>
	);
};

export default AnalysisProgress;
