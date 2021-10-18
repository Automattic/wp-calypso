import React from 'react';
import ListStep from './list';
import './style.scss';

export default function ImportOnboarding(): React.ReactNode {
	return (
		<div className="import__onboarding-page">
			<ListStep />
		</div>
	);
}
