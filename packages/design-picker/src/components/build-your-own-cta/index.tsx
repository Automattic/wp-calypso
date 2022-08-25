import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import type { FC } from 'react';
import './style.scss';

type Props = {
	onButtonClick?: () => void;
};

const BuildYourOwnCta: FC< Props > = ( { onButtonClick } ) => {
	const translate = useTranslate();

	return (
		<div className="build-your-own-cta-wrapper">
			<div className="build-your-own-cta__image-wrapper">
				<img className="build-your-own-cta__image" src="#" alt="Blank Canvas Header" />
			</div>
			<h3 className="build-your-own-cta__title"> { translate( 'Start with a blank canvas' ) } </h3>
			<p className="build-your-own-cta__subtitle">
				{ translate(
					"Can't find something you like? Create something of your own by mixing and matching patterns."
				) }
			</p>
			<Button className="build-your-own-cta__button" onClick={ onButtonClick } primary>
				{ translate( 'Get Started' ) }
			</Button>
		</div>
	);
};

export default BuildYourOwnCta;
