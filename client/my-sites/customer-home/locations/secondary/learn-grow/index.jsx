/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import FreePhotoLibrary from 'my-sites/customer-home/cards/education/free-photo-library';
import MasteringGutenberg from 'my-sites/customer-home/cards/education/mastering-gutenberg';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getHomeLayout } from 'state/selectors/get-home-layout';

/**
 * Style dependencies
 */
import './style.scss';

const cardComponents = {
	'home-education-free-photo-library': FreePhotoLibrary,
	'home-education-gutenberg': MasteringGutenberg,
};

const LearnGrow = ( { cards } ) => {
	const translate = useTranslate();

	if ( ! cards || ! cards.length ) {
		return null;
	}

	return (
		<>
			<h2 className="learn-grow__heading customer-home__section-heading">
				{ translate( 'Learn and grow' ) }
			</h2>
			<Card className="learn-grow__content">
				{ cards.map(
					( card, index ) =>
						cardComponents[ card ] &&
						React.createElement( cardComponents[ card ], {
							key: index,
						} )
				) }
			</Card>
		</>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const layout = getHomeLayout( state, siteId );

	return {
		cards: layout?.[ 'secondary.learn-grow' ] ?? [],
	};
};

export default connect( mapStateToProps )( LearnGrow );
