import { FunctionComponent } from 'react';
import './style.scss';

const LoadingPlaceholder: FunctionComponent = () => (
	<div className="backup-retention-management__loading loading">
		<div className="loading__placeholder" />
	</div>
);

export default LoadingPlaceholder;
