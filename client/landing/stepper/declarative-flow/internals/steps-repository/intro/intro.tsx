import { Button } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import type { WPElement } from '@wordpress/element';

interface Props {
	onSubmit: () => void;
	flowName: string;
}

interface IntroContent {
	[ key: string ]: {
		title: WPElement | string;
		text?: WPElement;
		buttonText: string;
	};
}

const Intro: React.FC< Props > = ( { onSubmit, flowName } ) => {
	const { __ } = useI18n();

	const introContent: IntroContent = {
		newsletter: {
			title: __( 'Sign in. Set up. Send out.' ),
			text: createInterpolateElement(
				__(
					`You’re a few steps away from launching a beautiful Newsletter with<br />everything you’ll ever need to grow your audience.`
				),
				{ br: <br /> }
			),
			buttonText: __( 'Start building your Newsletter' ),
		},
		'link-in-bio': {
			title: createInterpolateElement(
				__( 'You’re 3 minutes away from<br />a stand-out Link in Bio site.<br />Ready? ' ),
				{ br: <br /> }
			),
			buttonText: __( 'Get started' ),
		},
	};

	return (
		<div className="intro__content">
			<h1 className="intro__title">
				<span>{ introContent[ flowName ].title }</span>
			</h1>
			{ introContent[ flowName ].text && <div> { introContent[ flowName ].text } </div> }
			<Button className="intro__button" primary onClick={ onSubmit }>
				{ introContent[ flowName ].buttonText }
			</Button>
		</div>
	);
};

export default Intro;
