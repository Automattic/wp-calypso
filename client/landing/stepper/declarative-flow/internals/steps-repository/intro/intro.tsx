import { Button } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import type { WPElement } from '@wordpress/element';

interface Props {
	goNext: () => void;
	flowName: string;
}

interface IntroContent {
	[ key: string ]: {
		content: WPElement;
		button: string;
	};
}

const Intro: React.FC< Props > = ( { goNext, flowName } ) => {
	const { __ } = useI18n();

	const intro: IntroContent = {
		newsletter: {
			content: createInterpolateElement(
				__( 'Your stories, right into your<br /> readers’ inbox, now!' ),
				{ br: <br /> }
			),
			button: __( 'Create your newsletter' ),
		},
		'link-in-bio': {
			content: createInterpolateElement(
				__( 'Your short bio and links,<br /> accessible to your<br /> audience in minutes' ),
				{ br: <br /> }
			),
			button: __( 'Create your link in bio' ),
		},
	};

	createInterpolateElement( __( 'Let’s set up your<br />Link in Bio' ), { br: <br /> } );

	return (
		<div className="intro__content">
			<h1 className="intro__title">
				<span>{ intro[ flowName ].content }</span>
			</h1>
			<Button className="intro__button" primary onClick={ goNext }>
				{ intro[ flowName ].button }
			</Button>
		</div>
	);
};

export default Intro;
