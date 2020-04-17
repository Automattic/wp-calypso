/**
 * External dependencies
 */
import React from 'react';
import { isDesktop } from '@automattic/viewport';

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
				{ links }
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
