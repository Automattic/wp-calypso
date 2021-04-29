/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'calypso/components/banner';

/**
 * Style dependencies
 */
import './style.scss';

class FreeDomainExplainer extends React.Component {
	handleClick = () => {
		const hideFreePlan = true;

		this.props.onSkip( undefined, hideFreePlan );
	};

	getDescription() {
		const { translate, locale } = this.props;

		return (
			<>
				<p className="free-domain-explainer__subtitle">
					{ locale === 'en'
						? translate(
								"We'll pay the registration fees for your new domain when you choose an annual plan during the next step."
						  )
						: translate(
								"We'll pay the registration fees for your new domain when you choose a paid plan during the next step."
						  ) }
				</p>
				<p className="free-domain-explainer__subtitle">
					{ translate( "You can claim your free custom domain later if you aren't ready yet." ) }
				</p>
			</>
		);
	}

	render() {
		const { translate, locale } = this.props;
		const title =
			locale === 'en'
				? translate( 'Get a free one-year domain registration with any paid annual plan.' )
				: translate( 'Get a free one-year domain registration with any paid plan.' );

		return (
			<Banner
				className="free-domain-explainer"
				callToAction={ translate( 'Review our plans to get started' ) }
				description={ this.getDescription() }
				horizontal
				title={ title }
				primaryButton={ false }
				onClick={ this.handleClick }
			/>
		);
	}
}

export default localize( FreeDomainExplainer );
