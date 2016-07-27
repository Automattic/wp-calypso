/**
 * External dependencies
 */

import React, { Component, PropTypes, createElement } from 'react';
import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import debugModule from 'debug';
import get from 'lodash/get';
import find from 'lodash/find';
import map from 'lodash/map';
import classnames from 'classnames';

/**
* Internal dependencies
*/
import Card from 'components/card';
import { getDiscoverPostById } from 'state/reader/discover/selectors';
import StandardPick from './standard-pick';
import QuotePick from './quote-pick';
import ImagePick from './image-pick';
import SitePick from './site-pick';
import DiscoverCardFooter from './footer';

const debug = debugModule( 'calypso:reader:discover' ); //eslint-disable-line no-unused-vars

function cardFactory( sourceData ) {
	const pickCardClasses = {
			'standard-pick': StandardPick,
			'site-pick': SitePick,
			'image-pick': ImagePick,
			'quote-pick': QuotePick,
		},
		postFormats = map( get( sourceData, 'discover_fp_post_formats' ), 'slug' ),
		pickFormat = find( postFormats, format => format.match( /-pick/ ) );

	return get( pickCardClasses, pickFormat, StandardPick );
}

class DiscoverCard extends Component {

	static propTypes = {
		postId: PropTypes.number.isRequired
	}

	render() {
		const
			{ post, sourceData } = this.props,
			cardClasses = classnames(
				'reader-discover-card',
			);
		return (
			<Card className={ cardClasses } >
				{ createElement( cardFactory( sourceData ), post ) }
				<DiscoverCardFooter site={ get( sourceData, 'attribution' ) } categories={ get( post, 'categories', {} ) }/>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const post = getDiscoverPostById( state, ownProps.postId ),
			sourceData = get( post, 'discover_metadata' );

		return {
			post,
			sourceData
		};
	},
)( DiscoverCard );
