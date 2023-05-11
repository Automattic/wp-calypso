import { Gridicon } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function trackNavigation( url, cardName ) {
	// return composeAnalytics(
	// 	recordTracksEvent( 'calypso_customer_home_education', { url, card_name: cardName } ),
	// 	bumpStat( 'calypso_customer_home', cardName )
	// );
	console.log( 'trackNavigation', url, cardName );
	return null;
}

function ReaderRecommendedFollowsDialog( { title, description, links, cardName, modalLinks } ) {
	//const dispatch = useDispatch();

	console.log( 'ReaderRecommendedFollowsDialog', title, description, links, cardName, modalLinks );

	return (
		<div className="educational-content">
			<div className="educational-content__wrapper">
				<h2>{ title }</h2>
				<p className="educational-content__description customer-home__card-subheader">
					{ description }
				</p>
				<div className="educational-content__links">
					{ modalLinks &&
						modalLinks.map( ( { ModalComponent, modalComponentProps, onClick, text } ) => (
							<div className="educational-content__link" key={ text }>
								<ModalComponent { ...modalComponentProps } />
								<button onClick={ () => onClick() }>{ text }</button>
							</div>
						) ) }
				</div>
			</div>
		</div>
	);
}

ReaderRecommendedFollowsDialog.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.node.isRequired,
	links: PropTypes.array,
	cardName: PropTypes.string,
	modalLinks: PropTypes.array,
};
export default ReaderRecommendedFollowsDialog;
