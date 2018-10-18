/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import { requestStage } from 'state/stage/actions';
import SpinnerLine from 'components/spinner-line';

class Stage extends Component {
	state = {
		isProvisioning: false,
	};

	onClick = () => {
		this.setState( { isProvisioning: true } );
		this.props.requestStage( this.props.siteId );
	};

	render() {
		const { isProvisioning } = this.state;
		const { credentials, translate } = this.props;

		let description;

		if ( credentials ) {
			description = translate(
				'Your staging site URL is https://%(url)s. You can log in using your WordPress credentials from your production site.',
				{
					args: {
						url: credentials.host,
					},
				}
			);
		} else if ( isProvisioning ) {
			description = translate(
				'Our systems are hard at work creating a new staging site just for you. Your URL will be available shortly.'
			);
		} else {
			description = translate(
				'Create an instant clone of your site for testing without altering your live site.'
			);
		}

		return (
			<CompactCard>
				<p className="site-tools__section-title">{ translate( 'Staging Site' ) }</p>
				<p className="site-tools__section-desc">{ description }</p>
				{ isProvisioning && (
					<p className="site-tools__section-desc">
						<SpinnerLine />
					</p>
				) }
				{ ! isProvisioning &&
					! credentials && (
						<Button primary compact onClick={ this.onClick }>
							{ translate( 'Create' ) }
						</Button>
					) }
				{ credentials && (
					<Button primary compact target="_blank" href={ `https://${ credentials.host }` }>
						{ translate( 'Visit Staging' ) }
					</Button>
				) }
			</CompactCard>
		);
	}
}

export default connect(
	null,
	{ requestStage }
)( localize( Stage ) );
