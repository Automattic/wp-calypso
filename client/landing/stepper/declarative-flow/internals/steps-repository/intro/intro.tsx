import { Button } from '@automattic/components';
import type { WPElement } from '@wordpress/element';

interface Props {
	onSubmit: () => void;
	introContent: IntroContent;
}

export interface IntroContent {
	title: WPElement | string;
	text?: WPElement;
	buttonText: string;
}

const Intro: React.FC< Props > = ( { onSubmit, introContent } ) => {
	const { __ } = useI18n();

	return (
		<>
			<div className="intro__content">
				<h1 className="intro__title">
					<span>{ introContent.title }</span>
				</h1>
				{ introContent.text && <div className="intro__description"> { introContent.text } </div> }
				<Button className="intro__button" primary onClick={ onSubmit }>
					{ introContent.buttonText }
				</Button>
			</div>
		</>
	);
};

export default Intro;
