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
import Card from 'components/card';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import Button from 'components/button';

class GoogleMyBusinessNew extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const nextHref = '/google-my-business/create/search/' + siteId;
		const backHref = '/stats/' + siteId;

		return (
			<Main className="google-my-business-new google-my-business" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<div className="google-my-business-new__text">
						<img
							className="select-business-type__explanation-image"
							src="/calypso/images/google-my-business/business-local.svg"
							alt="Local business illustration"
						/>
						<h2>{ translate( 'It looks like you might be new to Google My Business' ) }</h2>
						<p>
							{ translate(
								'Google My Business lists your local business on Google Search and Google Maps. ' +
									'It works for businesses that have a physical location or serve a local area'
							) }
						</p>

						<Button
							primary
							className="google-my-business-new__button google-my-business-new__button-primary"
							href={ nextHref }
						>
							{ translate( 'Create My Listing' ) }
						</Button>
						<Button className="google-my-business-new__button" href={ backHref }>
							{ translate( 'No thanks' ) }
						</Button>
					</div>
				</Card>
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( GoogleMyBusinessNew ) );
