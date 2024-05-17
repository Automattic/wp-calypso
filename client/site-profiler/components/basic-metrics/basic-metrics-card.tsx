import { LineIndicator } from './line-indicator';
import './card-styles.scss';

export const BasicMetricsCard = () => {
	return (
		<div className="basic-metrics-card">
			<div className="basic-metrics-card__header-container">
				<LineIndicator />
				<div className="basic-metrics-card__header-body">
					<h5 className="basic-metrics-card__title">Cumulative Layout Shift</h5>
					<h2 className="basic-metrics-card__value">10</h2>
				</div>
			</div>
			<div className="basic-metrics-card__main-paragraph">
				Your site experiences more layout shifts than most, frustrating users and leading to higher
				bounce rates.
			</div>
			<p className="basic-metrics-card__sub-paragraph">Another paragraph with smaller font.</p>
			<a className="basic-metrics-card__card-cta" href="/migrate">
				Stabilize with us
			</a>
		</div>
	);
};
