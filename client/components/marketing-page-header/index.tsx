/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	buttonCopy: string;
	description: string;
	handleButtonClick: () => void;
	illustrationAlt: string;
	illustrationUrl: string;
	title: string;
}

const MarketingPageHeader: FunctionComponent< Props > = ( {
	buttonCopy,
	description,
	handleButtonClick,
	illustrationAlt,
	illustrationUrl,
	title,
} ) => {
	return (
		<Card className="marketing-page-header__body">
			<div className="marketing-page-header__image-wrapper">
				<img
					className="marketing-page-header__image"
					src={ illustrationUrl }
					alt={ illustrationAlt }
				/>
			</div>

			<div className="marketing-page-header__info">
				<h1 className="marketing-page-header__title">{ title }</h1>

				<h2 className="marketing-page-header__description">{ description }</h2>

				<div className="marketing-page-header__button-row">
					<Button onClick={ handleButtonClick } primary>
						{ buttonCopy }
					</Button>
				</div>
			</div>
		</Card>
	);
};

export default MarketingPageHeader;
