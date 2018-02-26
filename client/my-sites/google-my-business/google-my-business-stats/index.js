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
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import { recordTracksEvent } from 'state/analytics/actions';

class Stats extends Component {
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
			<div className="google-my-business-stats">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<h1 className="google-my-business-stats__header">
						Google My Business: Whitley's Flowers
					</h1>
					<p>5385 people found you on Google</p>
					<p>
						19 people asked for directions<br />+36% from November 2017
					</p>
					<p>
						60 people visited your website<br />-28% from November 2017
					</p>
					<p>
						49 people called you<br />+69% from November 2017
					</p>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( Stats ) );
