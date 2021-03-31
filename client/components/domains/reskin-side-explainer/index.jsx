/**
 * External dependencies
 */
import React from 'react';

/**
 * Style dependencies
 */
import './style.scss';

class ReskinSideExplainer extends React.Component {
	render() {
		const { title, subtitle, ctaText } = this.props;

		return (
			/* eslint-disable jsx-a11y/click-events-have-key-events */
			<div className="reskin-side-explainer">
				<div className="reskin-side-explainer__title">{ title }</div>
				<div className="reskin-side-explainer__subtitle">{ subtitle }</div>
				<div className="reskin-side-explainer__cta">
					<span
						className="reskin-side-explainer__cta-text"
						role="button"
						onClick={ this.props.onClick }
						tabindex="0"
					>
						{ ctaText }
					</span>
				</div>
			</div>
			/* eslint-enable jsx-a11y/click-events-have-key-events */
		);
	}
}

export default ReskinSideExplainer;
