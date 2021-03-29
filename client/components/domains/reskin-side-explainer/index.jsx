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
			<div className="reskin-side-explainer">
				<div className="reskin-side-explainer__title">{ title }</div>
				<div className="reskin-side-explainer__subtitle">{ subtitle }</div>
				<div className="reskin-side-explainer__cta">
					<span className="cta-text" onClick={ this.props.onClick }>
						{ ctaText }
					</span>
				</div>
			</div>
		);
	}
}

export default ReskinSideExplainer;
