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
import Main from 'components/main';

class ShowListOfLocation extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = { locations: [ { placeholder: true }, { placeholder: true } ] };

	componentDidMount() {
		setTimeout( () => this.loadListings(), 1000 );
	}

	loadListings = () => {
		this.setState( {
			locations: [
				{
					title: "Cate's Cookies",
					img: '/calypso/images/google-my-business/cookies.png',
					text: '345 North Avenue, Talihassee, FL 34342, USA',
					verified: true,
				},
				{
					title: 'Pinch Bakeshop',
					img: '/calypso/images/google-my-business/pinch.png',
					text: '234 Piedmont Drive, Talihassee, FL 34342, USA',
					verified: false,
				},
			],
		} );
	};

	goBack = () => {
		page.back( `/google-my-business/${ this.props.siteId }` );
	};

	render() {
		const { translate, siteId } = this.props;
		const searchHref = '/google-my-business/create/search/' + siteId;
		const statsHref = '/google-my-business/stats/' + siteId;

		return (
			<Main className="google-my-business show-list-of-locations" wideLayout>
				<HeaderCake isCompact={ false } alwaysShowActionText={ false } onClick={ this.goBack }>
					{ translate( 'Google My Business' ) }
				</HeaderCake>

				<CompactCard>
					<h1>{ translate( 'Select the listing you would like to connect to' ) }</h1>
				</CompactCard>

				{ this.state.locations.map( ( location, index ) => (
					<CompactCard key={ index }>
						<GoogleMyBusinessLocation
							title={ location.title }
							img={ location.img }
							text={ <div>{ location.text }</div> }
							href={ statsHref }
							verified={ location.verified }
							placeholder={ location.placeholder }
						/>
					</CompactCard>
				) ) }

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
			</Main>
		);
	}
}

export default connect( undefined, { recordTracksEvent } )( localize( ShowListOfLocation ) );
