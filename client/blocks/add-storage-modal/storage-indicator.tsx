import React from 'react';

const StorageIndicator: React.FC = () => {
	return (
		<div className="storage-indicator">
			<p>63 GB total, 6.5 GB used</p>
			<div className="storage-bar">
				<span className="plan-storage">13 GB plan storage</span>
				<span className="add-on-storage">50 GB storage add-on</span>
			</div>
		</div>
	);
};

export default StorageIndicator;
