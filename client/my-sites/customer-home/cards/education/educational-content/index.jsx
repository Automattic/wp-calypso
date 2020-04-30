/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import InlineSupportLink from 'components/inline-support-link';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

const EducationalContent = ( { title, description, links, illustration } ) => {
	return (
		<div className="educational-content">
			<div className="educational-content__wrapper">
				<h3>{ title }</h3>
				<p className="educational-content__description customer-home__card-subheader">
					{ description }
				</p>
				<div className="educational-content__links">
					{ links.map( ( { postId, url, externalLink, text, icon, tracksEvent, statsName } ) => (
						<div
							className={ classnames( 'educational-content__link', {
								'is-external-link': externalLink,
							} ) }
							key={ url }
						>
							{ icon && <Gridicon icon={ icon } size={ 18 } /> }
							{ postId && (
								<InlineSupportLink
									supportPostId={ postId }
									supportLink={ url }
									showIcon={ false }
									text={ text }
									tracksEvent={ tracksEvent }
									statsGroup="calypso_customer_home"
									statsName={ statsName }
								/>
							) }
							{ externalLink && (
								<ExternalLink href={ url } icon>
									{ text }
								</ExternalLink>
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

export default EducationalContent;
