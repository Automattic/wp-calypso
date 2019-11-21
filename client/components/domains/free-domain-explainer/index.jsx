/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

/**
 * Style dependencies
 */
import './style.scss';

class FreeDomainExplainer extends React.Component {
	handleClick = () => {
		const hideFreePlan = true;
		const tracksEventName = 'calypso_domain_step_skip_to_paid_plans';

		this.props.onSkip( undefined, hideFreePlan, tracksEventName );
	};
	render() {
		return (
			<div className="free-domain-explainer card is-compact">
				<header>
					<h1 className="free-domain-explainer__title">
						Get a free one-year domain registration with any paid plan.
					</h1>
					<p className="free-domain-explainer__subtitle">
						We'll pay the registration fees for your new domain when you choose a paid plan during
						the next step.
					</p>
					<p className="free-domain-explainer__subtitle">
						You can claim your free custom domain later if you aren't ready yet.
						<Button
							borderless
							className="free-domain-explainer__subtitle-link"
							onClick={ this.handleClick }
							href
						>
							Review our plans to get started &raquo;
						</Button>
					</p>
				</header>
			</div>
		);
	}
}

export default FreeDomainExplainer;
