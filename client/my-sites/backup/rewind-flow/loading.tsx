import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';

const RewindFlowLoading: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<>
			<div className="rewind-flow__header">
				<div className="rewind-flow__icon-placeholder" />
			</div>
			<h3 className="rewind-flow__title-placeholder">{ translate( 'Loading restore status…' ) }</h3>
		</>
	);
};

export default RewindFlowLoading;
