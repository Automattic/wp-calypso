/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class FreeDomainExplainer extends React.Component {
	constructor( props ) {
		super( props );
		this.TextWrapper = this.TextWrapper.bind( this );
	}

	handleClick = () => {
		const hideFreePlan = true;

		this.props.onSkip( undefined, hideFreePlan );
	};

	/**
	 * Wraps content in a <span> if the user is assigned the
	 * `reskinned` group of the `reskinSignupFlow` a/b test.
	 * If not, renders the content in a <p> as the default.
	 *
	 * @param {*} props Props passed to the <p> or <span>
	 */
	TextWrapper( props ) {
		const { isReskinned } = props;
		props = omit( props, 'isReskinned' );
		return isReskinned ? (
			<span { ...props }>{ props.children }</span>
		) : (
			<p { ...props }>{ props.children }</p>
		);
	}

	render() {
		const { translate, isReskinned, locale } = this.props;
		const { TextWrapper } = this;

		return (
			<div className="free-domain-explainer card is-compact">
				<header>
					<h1 className="free-domain-explainer__title">
						{ locale === 'en'
							? translate( 'Get a free one-year domain registration with any paid annual plan.' )
							: translate( 'Get a free one-year domain registration with any paid plan.' ) }
					</h1>
					<TextWrapper className="free-domain-explainer__subtitle">
						{ locale === 'en'
							? translate(
									"We'll pay the registration fees for your new domain when you choose an annual plan during the next step."
							  )
							: translate(
									"We'll pay the registration fees for your new domain when you choose a paid plan during the next step."
							  ) }
					</TextWrapper>
					<TextWrapper className="free-domain-explainer__subtitle">
						{ translate( "You can claim your free custom domain later if you aren't ready yet." ) }
						<Button
							borderless
							className="free-domain-explainer__subtitle-link"
							onClick={ this.handleClick }
						>
							{ translate( 'Review our plans to get started' ) } { ! isReskinned && <>&raquo;</> }
						</Button>
					</TextWrapper>
				</header>
			</div>
		);
	}
}

export default localize( FreeDomainExplainer );
