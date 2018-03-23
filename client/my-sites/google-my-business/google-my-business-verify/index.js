/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';
import Button from 'components/button';
import Main from 'components/main';

class GoogleMyBusinessVerify extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const href = '/google-my-business/stats/' + siteId;

		return (
			<Main className="google-my-business google-my-business-verify" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<CompactCard>
					<h2>{ translate( 'Choose a way to verify' ) }</h2>
					<div>
						{ translate( "Select how you'd like to get a verification code" ) }
						<br />
						<a href="https://business.google.com">{ translate( 'Learn More' ) }</a>
					</div>
				</CompactCard>
				<CompactCard>
					<h2>{ translate( 'Postcard by mail' ) }</h2>
					<p>{ translate( 'Have a postcard with your code mailed to this address. It should arrive in one to two weeks.' ) }</p>
					<p>
						Mike Shelton<br />
						7843 Saxon Wood Road<br />
						Richmond, Virginia 23234
					</p>
					<Button primary href={ href } className="google-my-business-verify__button">
						{ translate( 'Verify by mail' ) }
					</Button>
				</CompactCard>
				<CompactCard>
					<h2>{ translate( 'Verify later' ) }</h2>
					<p>{ translate( "You can't fully manage your listing until you're verified" ) }</p>
					<Button href={ href } className="google-my-business-verify__button">
						{ translate( 'Verify later' ) }
					</Button>
				</CompactCard>
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessVerify ) );
