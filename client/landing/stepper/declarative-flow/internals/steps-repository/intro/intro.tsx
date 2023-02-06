import { Button } from '@automattic/components';
import type { WPElement } from '@wordpress/element';

interface Props {
	onSubmit: () => void;
	introContent: IntroContent;
}

export interface IntroContent {
	title: WPElement | string;
	text?: WPElement | string;
	buttonText: string;
	moreButton?: IntroMoreButton;
}

export interface IntroMoreButton {
	text: string;
	onClick: () => void;
}

const Intro: React.FC< Props > = ( { onSubmit, introContent } ) => {
	return (
		<>
			<div className="intro__content">
				<h1 className="intro__title">
					<span>{ introContent.title }</span>
				</h1>
				{ introContent.text && <div className="intro__description"> { introContent.text } </div> }
				<div className="intro__button-row">
					<Button className="intro__button" primary onClick={ onSubmit }>
						{ introContent.buttonText }
					</Button>
					{ introContent.moreButton && (
						<Button
							className="intro__button-more"
							transparent
							onClick={ introContent.moreButton.onClick }
						>
							{ introContent.moreButton.text }
						</Button>
					) }
				</div>
			</div>
		</>
	);
};

export default Intro;
