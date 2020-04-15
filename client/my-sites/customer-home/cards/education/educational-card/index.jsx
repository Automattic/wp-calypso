/**
 * External dependencies
 */
import React from 'react';
import { isDesktop } from '@automattic/viewport';

/**
 * Style dependencies
 */
import './style.scss';

const EducationalCard = ( { header, text, links, illustration } ) => {
	return (
		<div className="educational-card">
			<div className="educational-card__content">
				<h3>{ header }</h3>
				<p className="educational-card__text customer-home__card-subheader">{ text }</p>
				{ links }
			</div>
			{ isDesktop() && (
				<div className="educational-card__illustration">
					<img src={ illustration } alt="" />
				</div>
			) }
		</div>
	);
};

export default EducationalCard;
