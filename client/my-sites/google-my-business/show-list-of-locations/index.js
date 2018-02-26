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
import HeaderCake from 'components/header-cake';
import Card from 'components/card';
import CTACard from '../select-business-type/cta-card';
import { recordTracksEvent } from 'state/analytics/actions';

class ShowListOfLocation extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const successHref = '/google-my-business/success/' + siteId;
		const searchHref = '/google-my-business/search-for-a-location/' + siteId;
		const verifyHref = '/google-my-business/verify/' + siteId;
		return (
			<div className="show-list-of-locations">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>
					<h1>{ translate( 'Select the listing you would like to connect to' ) }</h1>
				</Card>

				<CTACard
					headerText={ "Cate's Cookies" }
					mainText={ '345 North Avenue<br>' + 'Talihassee, FL 34342<br>' + 'USA' }
					buttonText={ translate( 'Connect', {
						comment: 'Call to Action to add a business listing to Google My Business',
					} ) }
					buttonHref={ successHref }
				/>

				<CTACard
					headerText={ 'Pinch Bakeshop' }
					mainText={ '234 Piedmont Drive<br>' + 'Talihassee, FL 34342<br>' + 'USA' }
					buttonText={ translate( 'Connect', {
						comment: 'Call to Action to add a business listing to Google My Business',
					} ) }
					buttonHref={ verifyHref }
				/>

				<Card>
					{ translate(
						"Don't see the listing you are trying to connect? {{a}}Search for your business{{/a}}.",
						{
							components: {
								a: <a href={ searchHref } />,
							},
						}
					) }
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( ShowListOfLocation ) );
