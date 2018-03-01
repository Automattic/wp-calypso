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
import CompactCard from 'components/card/compact';
import GoogleMyBusinessLocation from '../google-my-business-location';
import HeaderCake from 'components/header-cake';
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

				<CompactCard>
					<h1>{ translate( 'Select the listing you would like to connect to' ) }</h1>
				</CompactCard>

				<CompactCard>
					<GoogleMyBusinessLocation
						title="Cate's Cookies"
						text={
							<div>
								345 North Avenue<br />Talihassee, FL 34342<br />USA
							</div>
						}
						href={ successHref }
						verified={ true }
					/>
				</CompactCard>

				<CompactCard>
					<GoogleMyBusinessLocation
						title="Pinch Bakeshop"
						text={
							<div>
								234 Piedmont Drive<br />Talihassee, FL 34342<br />USA
							</div>
						}
						href={ verifyHref }
						verified={ false }
					/>
				</CompactCard>

				<Card className="show-list-of-locations__search">
					{ translate(
						"Don't see the listing you are trying to connect? {{a}}Add your business{{/a}}.",
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
