/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class FreeDomainExplainer extends React.Component {
	handleClick = () => {
		const hideFreePlan = true;

		this.props.onSkip( undefined, hideFreePlan );
	};

	renderCustomDomainExplainer() {
		return (
			<div className="free-domain-explainer card is-compact">
				<header>
					<h1 className="free-domain-explainer__title">All our custom domains need a paid plan.</h1>
					<p className="free-domain-explainer__subtitle">
						That's why we'll pay the registration fees for your new domain when you choose a paid
						plan during the next step.
					</p>
					<p className="free-domain-explainer__subtitle">
						You can always claim your free custom domain later if you aren't ready yet.
					</p>
				</header>
			</div>
		);
	}

	render() {
		const { showFreeDomainExplainerForFreePlan, translate } = this.props;

		if ( showFreeDomainExplainerForFreePlan ) {
			return this.renderCustomDomainExplainer();
		}

		return (
			<div className="free-domain-explainer card is-compact">
				<header>
					<h1 className="free-domain-explainer__title">
						{ translate( 'Get a free one-year domain registration with any paid plan.' ) }
					</h1>
					<p className="free-domain-explainer__subtitle">
						{ translate(
							"We'll pay the registration fees for your new domain when you choose a paid plan during the next step."
						) }
					</p>
					<p className="free-domain-explainer__subtitle">
						{ translate( "You can claim your free custom domain later if you aren't ready yet." ) }
						<Button
							borderless
							className="free-domain-explainer__subtitle-link"
							onClick={ this.handleClick }
						>
							{ translate( 'Review our plans to get started' ) } &raquo;
						</Button>
					</p>
				</header>
			</div>
		);
	}
}

export default localize( FreeDomainExplainer );
