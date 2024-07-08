import type { FC } from 'react';
import './style.scss';

export const Skeleton: FC = () => {
	return (
		<div className="import__upgrade-plan-details import__upgrade-plan-details--loading">
			<div className="import__upgrade-plan-period-switcher">
				<div
					className="import-upgrade-plan-skeleton"
					style={ { width: '250px', height: '38px' } }
				/>
			</div>
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
				<div className="import__upgrade-plan-hosting-details">
					<div className="import__upgrade-plan-hosting-details-card-container">
						<div
							className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--dark-gray"
							style={ { width: '131px', height: '17px', margin: '0 auto 14px' } }
						/>
						<div
							className="import-upgrade-plan-skeleton"
							style={ { width: '277px', margin: '0 auto 40px' } }
						/>

						{ Array.from( { length: 3 } ).map( ( _, index ) => (
							<div
								key={ index }
								className="import-upgrade-plan-skeleton__flex-container"
								style={ { marginBottom: '12px' } }
							>
								<div
									className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--light-highlight"
									style={ {
										width: '36px',
										height: '36px',
										marginRight: '8px',
										borderRadius: '4px',
									} }
								/>
								<div>
									<div
										className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--dark-gray"
										style={ { width: '111px' } }
									/>
									<div className="import-upgrade-plan-skeleton" style={ { width: '257px' } } />
								</div>
							</div>
						) ) }

						<div
							className="import-upgrade-plan-skeleton"
							style={ { width: '277px', margin: '28px auto 10px' } }
						/>

						<div
							className="import-upgrade-plan-skeleton__flex-container"
							style={ { justifyContent: 'center' } }
						>
							<div className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--circles-item" />
							<div className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--circles-item" />
							<div className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--circles-item" />
							<div className="import-upgrade-plan-skeleton import-upgrade-plan-skeleton--circles-item" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
