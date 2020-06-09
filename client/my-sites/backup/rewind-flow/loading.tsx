/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Spinner from 'components/spinner';

const RewindFlowLoading: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<>
			<div className="rewind-flow__header">
				<Spinner size={ 48 } />
			</div>
			<h3 className="rewind-flow__title-placeholder">{ translate( 'Loading restore status…' ) }</h3>
		</>
	);
};

export default RewindFlowLoading;
