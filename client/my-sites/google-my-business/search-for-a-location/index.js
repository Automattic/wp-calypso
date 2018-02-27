/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import GoogleMyBusinessLocation from '../google-my-business-location';
import HeaderCake from 'components/header-cake';
import SearchCard from 'components/search-card';

class SearchForALocation extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const verifyHref = '/google-my-business/verify/' + siteId;
		const createHref = '/google-my-business/create/' + siteId;
		return (
			<div className="search-for-a-location">
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<Card>What is the name of your business?</Card>

				<SearchCard onSearch={ noop } className="search-for-a-location__search-card is-compact" />

				<CompactCard>
					<GoogleMyBusinessLocation
						title="Cate's Cookies"
						text={
							<p>
								345 North Avenue<br />Talihassee, FL 34342<br />USA
							</p>
						}
						href={ verifyHref }
					/>
				</CompactCard>

				<CompactCard>
					<GoogleMyBusinessLocation
						title="Pinch Bakeshop"
						text={
							<p>
								234 Piedmont Drive<br />Talihassee, FL 34342<br />USA
							</p>
						}
						href={ verifyHref }
					/>
				</CompactCard>

				<Card>
					Can't find your business? <a href={ createHref }>Add it here.</a>
				</Card>
			</div>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( SearchForALocation ) );
