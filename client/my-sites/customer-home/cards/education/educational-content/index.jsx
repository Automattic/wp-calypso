/**
 * External dependencies
 */
import React from 'react';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
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
					{ links.map( ( { postId, url, text, icon, tracksEvent, statsName } ) => (
						<div className="educational-content__link" key={ postId }>
							{ icon && <Gridicon icon={ icon } size={ 18 } /> }
							<InlineSupportLink
								supportPostId={ postId }
								supportLink={ url }
								showIcon={ false }
								text={ text }
								tracksEvent={ tracksEvent }
								statsGroup="calypso_customer_home"
								statsName={ statsName }
							/>
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
