import { useMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';

type OwnProps = {
	showDateSeparators: boolean;
	showPagination: boolean;
};

const Loading: React.FC< OwnProps > = ( { showDateSeparators, showPagination } ) => {
	const isMobile = useMobileBreakpoint();

	return (
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		<div className="activity-card-list__loading-placeholder">
			<div className="filterbar" />
			{ showPagination && (
				<div
					className={ classNames( 'activity-card-list__pagination-top', {
						'is-compact': isMobile,
					} ) }
				/>
			) }
			<div key="activity-card-list__date-group-loading">
				{ showDateSeparators && (
					<div className="activity-card-list__date-group-date">
						<span>MMM Do</span>
					</div>
				) }
				<div className="activity-card-list__date-group-content">
					{ [ 1, 2, 3 ].map( ( i ) => (
						<div
							className="activity-card-list__secondary-card activity-card"
							key={ `loading-secondary-${ i }` }
						>
							<div className="activity-card__time">
								<div className="activity-card__time-text">Sometime</div>
							</div>
							<div className="card" />
						</div>
					) ) }
					<div className="activity-card-list__primary-card activity-card">
						<div className="activity-card__time">
							<div className="activity-card__time-text">Sometime</div>
						</div>
						<div className="card" />
					</div>
				</div>
			</div>
			{ showPagination && (
				<div
					className={ classNames( 'activity-card-list__pagination-bottom', {
						'is-compact': isMobile,
					} ) }
				/>
			) }
		</div>
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	);
};

export default Loading;
