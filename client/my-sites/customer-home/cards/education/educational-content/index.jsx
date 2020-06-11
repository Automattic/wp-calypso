/**
 * External dependencies
 */
import React from 'react';
import { isDesktop } from '@automattic/viewport';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import InlineSupportLink from 'components/inline-support-link';
import Gridicon from 'components/gridicon';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';

/**
 * Style dependencies
 */
import './style.scss';

const EducationalContent = ( {
	title,
	description,
	links,
	illustration,
	cardName,
	calypsoNavigation,
	trackExternalClick,
} ) => {
	return (
		<div className="educational-content">
			<div className="educational-content__wrapper">
				<h3>{ title }</h3>
				<p className="educational-content__description customer-home__card-subheader">
					{ description }
				</p>
				<div className="educational-content__links">
					{ links.map( ( { postId, url, calypsoLink, externalLink, text, icon } ) => (
						<div className="educational-content__link" key={ url }>
							{ icon && <Gridicon icon={ icon } size={ 18 } /> }
							{ postId && (
								<InlineSupportLink
									supportPostId={ postId }
									supportLink={ url }
									showIcon={ false }
									text={ text }
									tracksEvent="calypso_customer_home_education"
									statsGroup="calypso_customer_home"
									tracksOptions={ {
										url,
										card_name: cardName,
									} }
									statsName={ cardName }
								/>
							) }
							{ externalLink && (
								<ExternalLink
									href={ url }
									onClick={ () => {
										trackExternalClick( url, cardName );
									} }
									icon
								>
									{ text }
								</ExternalLink>
							) }
							{ calypsoLink && (
								<a
									href={ url }
									onClick={ ( event ) => {
										event.preventDefault();
										calypsoNavigation( url, cardName );
									} }
								>
									{ text }
								</a>
							) }
						</div>
					) ) }
				</div>
			</div>
			{ isDesktop() && (
				<div className="educational-content__illustration">
					<img src={ illustration } alt="" />
				</div>
			) }
		</div>
	);
};

const calypsoNavigation = ( url, cardName ) => {
	return withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_customer_home_education', { url, card_name: cardName } ),
			bumpStat( 'calypso_customer_home', cardName )
		),
		navigate( url )
	);
};

const trackExternalClick = ( url, cardName ) => {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_education', { url, card_name: cardName } ),
		bumpStat( 'calypso_customer_home', cardName )
	);
};

export default connect( null, {
	calypsoNavigation,
	trackExternalClick,
} )( EducationalContent );
