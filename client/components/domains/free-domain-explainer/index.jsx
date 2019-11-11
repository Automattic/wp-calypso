/** @format */

/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './style.scss';

class FreeDomainExplainer extends React.Component {
	render() {
		const className = classNames( 'free-domain-explainer is-compact', {
			card: this.props.isCard,
		} );

		return (
			<div className={ className }>
				<header>
					<h1 className="free-domain-explainer__title">
						Get a free one-year domain registration with any paid plan.
					</h1>
					<p className="free-domain-explainer__subtitle">
						We'll pay the registration fees for your new domain when you choose a paid plan on the
						next page.
					</p>
					<p className="free-domain-explainer__subtitle">
						If you’d like a free domain but aren't ready to choose, that’s no problem. Click here to
						start with a default WordPress.com domain, and can claim your free custom domain when
						you’re ready.
					</p>
				</header>
			</div>
		);
	}
}

export default FreeDomainExplainer;
