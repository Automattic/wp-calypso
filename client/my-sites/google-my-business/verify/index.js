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
import Button from 'components/button';
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import { recordTracksEvent } from 'state/analytics/actions';

class Verify extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;

		return (
			<div className="google-my-business-success">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<img src="/calypso/images/google-my-business/success.svg" width="100" height="103" />
					<h1 className="google-my-business-success__header">
						You've successfully created your Google Business listing for Cate's Cookies
					</h1>
					<p>
						When you have verified your listing you'll be able to view the stats for your Google
						Business listing in WordPress.com
					</p>
					<Button primary href="https://business.google.com/">
						Verify now
					</Button>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( Verify ) );
