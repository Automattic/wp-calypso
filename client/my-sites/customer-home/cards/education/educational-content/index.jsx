import { Gridicon } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { useDispatch } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MaterialIcon from 'calypso/components/material-icon';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function trackNavigation( url, cardName ) {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_education', { url, card_name: cardName } ),
		bumpStat( 'calypso_customer_home', cardName )
	);
}

export default function EducationalContent( {
	title,
	description,
	links,
	modalLinks,
	illustration,
	cardName,
} ) {
	const dispatch = useDispatch();

	return (
		<div className="educational-content">
			<div className="educational-content__wrapper">
				<h3>{ title }</h3>
				<p className="educational-content__description customer-home__card-subheader">
					{ description }
				</p>
				<div className="educational-content__links">
					{ links &&
						links.map( ( { postId, url, calypsoLink, externalLink, text, icon, materialIcon } ) => (
							<div className="educational-content__link" key={ url }>
								{ icon && <Gridicon icon={ icon } size={ 18 } /> }
								{ materialIcon && <MaterialIcon icon={ materialIcon } /> }
								{ postId && (
									<InlineSupportLink
										supportPostId={ postId }
										supportLink={ url }
										showIcon={ false }
										tracksEvent="calypso_customer_home_education"
										statsGroup="calypso_customer_home"
										tracksOptions={ {
											url,
											card_name: cardName,
										} }
										statsName={ cardName }
									>
										{ text }
									</InlineSupportLink>
								) }
								{ externalLink && (
									<ExternalLink
										href={ url }
										onClick={ () => dispatch( trackNavigation( url, cardName ) ) }
										icon
									>
										{ text }
									</ExternalLink>
								) }
								{ calypsoLink && (
									<a href={ url } onClick={ () => dispatch( trackNavigation( url, cardName ) ) }>
										{ text }
									</a>
								) }
							</div>
						) ) }
					{ modalLinks &&
						modalLinks.map( ( { ModalComponent, modalComponentProps, onClick, text } ) => (
							<div className="educational-content__link" key={ text }>
								<ModalComponent { ...modalComponentProps } />
								<button onClick={ () => onClick() }>{ text }</button>
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
}
