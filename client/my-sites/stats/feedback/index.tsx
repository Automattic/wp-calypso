import './style.scss';

function StatsFeedbackCard() {
	// A simple card component with feedback buttons.
	return (
		<div className="stats-feedback-card">
			<div className="stats-feedback-card__cta">
				<p>Hello from StatsFeedbackCard</p>
			</div>
			<div className="stats-feedback-card__actions">
				<button>one</button>
				<button>two</button>
			</div>
		</div>
	);
}

export default StatsFeedbackCard;
