/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

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
	render() {
		const { showDesignUpdate, translate } = this.props;

		const titleClassnames = classNames( 'free-domain-explainer__title', {
			'free-domain-explainer__title-domain-design-updates': showDesignUpdate,
		} );

		return (
			<div className="free-domain-explainer card is-compact">
				<header>
					<h1 className={ titleClassnames }>
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
