import { LoadingPlaceholder } from '@automattic/components';
import { FunctionComponent } from 'react';
import './style.scss';

const GranularRestoreLoading: FunctionComponent = () => {
	const RestoreLoadingPlaceholder = () => (
		<LoadingPlaceholder className="granular-restore__loading" />
	);

	return (
		<>
			<div className="rewind-flow__header">
				<RestoreLoadingPlaceholder />
			</div>
			<div className="rewind-flow__title">
				<RestoreLoadingPlaceholder />
			</div>
			<div className="rewind-flow__progress-bar">
				<div className="rewind-flow__progress-bar-header">
					<div className="rewind-flow__progress-bar-message">
						<RestoreLoadingPlaceholder />
					</div>
					<div className="rewind-flow__progress-bar-percent">
						<RestoreLoadingPlaceholder />
					</div>
				</div>
				<RestoreLoadingPlaceholder />
			</div>
			<div className="rewind-flow__info">
				<RestoreLoadingPlaceholder />
			</div>
			<div className="rewind-flow-notice">
				<RestoreLoadingPlaceholder />
			</div>
		</>
	);
};

export default GranularRestoreLoading;
