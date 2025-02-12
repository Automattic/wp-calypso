import { Gridicon, MaterialIcon, ExternalLink } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';

import './style.scss';

function trackNavigation( url, cardName ) {
	return composeAnalytics(
		recordTracksEvent( 'calypso_customer_home_education', { url, card_name: cardName } ),
		bumpStat( 'calypso_customer_home', cardName )
	);
}

function EducationalContent( {
	title,
	description,
	links,
	modalLinks,
	illustration,
	cardName,
	width,
	height,
	className,
} ) {
	const dispatch = useDispatch();

	return (
		<div className="educational-content">
			<div className="educational-content__wrapper">
				<h2>{ title }</h2>
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
			{ isDesktop() && illustration && (
				<div className={ `educational-content__illustration ${ className || '' }` }>
					<img src={ illustration } alt="" width={ width } height={ height } />
				</div>
			) }
		</div>
	);
}

// Custom propType function that checks for illustration prop is set and returns an error in case it s not.
function propTypeHasIllustration( props, propName, componentName ) {
	let error;
	if ( ! props.illustration ) {
		return;
	}

	const prop = props[ propName ];
	if ( typeof prop !== 'string' && typeof prop !== 'number' ) {
		error = new Error(
			`${ componentName } requires ${ propName } if an illustration is provided.`
		);
	}
	return error;
}
EducationalContent.propTypes = {
	title: PropTypes.string.isRequired,
	description: PropTypes.node.isRequired,
	links: PropTypes.array,
	modalLinks: PropTypes.array,
	illustration: PropTypes.string,
	cardName: PropTypes.string,
	className: PropTypes.string,
	width: propTypeHasIllustration,
	height: propTypeHasIllustration,
};
export default EducationalContent;
