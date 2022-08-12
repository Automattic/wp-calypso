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
		title: WPElement;
		buttonText: string;
	};
}

const Intro: React.FC< Props > = ( { goNext, flowName } ) => {
	const { __ } = useI18n();

	const introContent: IntroContent = {
		newsletter: {
			title: createInterpolateElement(
				__( 'Your stories, right into your<br /> readers’ inbox, now!' ),
				{ br: <br /> }
			),
			buttonText: __( 'Create your newsletter' ),
		},
		'link-in-bio': {
			title: createInterpolateElement(
				__( 'Your short bio and links,<br /> accessible to your<br /> audience in minutes' ),
				{ br: <br /> }
			),
			buttonText: __( 'Create your link in bio' ),
		},
	};

	createInterpolateElement( __( 'Let’s set up your<br />Link in Bio' ), { br: <br /> } );

	return (
		<div className="intro__content">
			<h1 className="intro__title">
				<span>{ introContent[ flowName ].title }</span>
			</h1>
			<Button className="intro__button" primary onClick={ goNext }>
				{ introContent[ flowName ].buttonText }
			</Button>
		</div>
	);
};

export default Intro;
