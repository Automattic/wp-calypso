import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { JETPACK_CONTACT_SUPPORT, JETPACK_SUPPORT, SUPPORT_ROOT } from '@automattic/urls';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import supportImage from 'calypso/assets/images/illustrations/dotcom-support.svg';
import SupportButton from 'calypso/components/support-button';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

export class HappinessSupport extends Component {
	static propTypes = {
		isJetpack: PropTypes.bool,
		isJetpackFreePlan: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		contactButtonEventName: PropTypes.string,
	};

	static defaultProps = {
		isJetpack: false,
		isJetpackFreePlan: false,
	};

	onContactButtonClick = () => {
		if ( this.props.contactButtonEventName ) {
			this.props.recordTracksEvent( this.props.contactButtonEventName );
		}
	};

	getHeadingText() {
		const { isJetpackFreePlan, translate } = this.props;
		return isJetpackFreePlan
			? translate( 'Support documentation' )
			: translate( 'Priority support' );
	}

	getSupportText() {
		const { isJetpackFreePlan, translate } = this.props;
		const components = {
			strong: <strong />,
		};
		return isJetpackFreePlan
			? translate(
					'{{strong}}Need help?{{/strong}} Search our support site to find out about your site, your account, and how to make the most of WordPress.',
					{ components }
			  )
			: translate(
					'{{strong}}Need help?{{/strong}} A Happiness Engineer can answer questions about your site and your account.',
					{ components }
			  );
	}

	getSupportButtons() {
		const { isJetpack } = this.props;

		return (
			<div className="happiness-support__buttons">
				{ isJetpack ? this.renderJetpackContactButton() : this.renderHelpCenterButton() }
				{ this.renderSupportButton() }
			</div>
		);
	}

	renderJetpackContactButton() {
		return (
			<Button
				href={ JETPACK_CONTACT_SUPPORT }
				target="_blank"
				onClick={ this.onContactButtonClick }
				className="happiness-support__contact-button"
			>
				{ this.props.translate( 'Ask a question' ) }
			</Button>
		);
	}

	renderHelpCenterButton() {
		return (
			<SupportButton
				isLink={ false }
				onClick={ this.onContactButtonClick }
				className="happiness-support__livechat-button"
				skipToContactOptions
			>
				{ this.props.translate( 'Ask a question' ) }
			</SupportButton>
		);
	}

	renderIllustration() {
		return (
			<div className="happiness-support__image">
				<div className="happiness-support__icon">
					<img alt="" src={ supportImage } />
				</div>
			</div>
		);
	}

	renderSupportButton() {
		let url = localizeUrl( SUPPORT_ROOT );

		if ( this.props.isJetpack ) {
			url = JETPACK_SUPPORT;
		}

		return (
			<Button
				borderless
				href={ url }
				target="_blank"
				rel="noopener noreferrer"
				className="happiness-support__support-button"
			>
				<Gridicon icon="external" />
				<span>{ this.props.translate( 'Support documentation' ) }</span>
			</Button>
		);
	}

	render() {
		const classes = {
			'is-placeholder': this.props.isPlaceholder,
		};

		return (
			<div className={ clsx( 'happiness-support', classes ) }>
				{ this.renderIllustration() }

				<div className="happiness-support__text">
					<h3 className="happiness-support__heading">{ this.getHeadingText() }</h3>
					<p className="happiness-support__description">{ this.getSupportText() }</p>
					{ this.getSupportButtons() }
				</div>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent } )( localize( HappinessSupport ) );
