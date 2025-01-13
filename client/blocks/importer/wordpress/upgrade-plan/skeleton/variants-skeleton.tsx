import type { FC } from 'react';
import './style.scss';

export const VariantsSkeleton: FC = () => {
	const variantSkeleton = (
		<div className="import__upgrade-plan-container">
			<div className="import__upgrade-plan-features-container">
				<div
					className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--dark-gray"
					style={ { width: '173px', height: '32px', marginBottom: '20px' } }
				/>
				<div className="import-upgrade-plan-skeleton" style={ { width: '277px' } } />
				<div
					className="import-upgrade-plan-skeleton"
					style={ { width: '195px', marginBottom: '40px' } }
				/>
				<div
					className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--dark-gray"
					style={ { width: '173px', height: '32px' } }
				/>
				<div
					className="import-upgrade-plan-skeleton"
					style={ { width: '103px', marginBottom: '40px' } }
				/>
				<div
					className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--dark-highlight"
					style={ { width: '305px', height: '32px', borderRadius: '4px' } }
				/>
				<div
					className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--dark-highlight"
					style={ { width: '103px', margin: '0 auto' } }
				/>
			</div>
		</div>
	);
	return (
		<div className="import__upgrade-plan">
			<div className="import__upgrade-plan-details import__upgrade-plan-details--loading">
				{ variantSkeleton }
				{ variantSkeleton }
				{ variantSkeleton }
			</div>
		</div>
	);
};
