import { Button } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	goNext: () => void;
	flowName: string | null;
}

const Intro: React.FC< Props > = ( { goNext, flowName } ) => {
	const { __ } = useI18n();

	const introTitle =
		flowName === 'link-in-bio'
			? createInterpolateElement( __( 'Let’s set up your<br />Link in Bio' ), { br: <br /> } )
			: createInterpolateElement( __( 'Let’s set up your<br />Newsletter' ), { br: <br /> } );

	return (
		<div className="intro__content">
			<h1 className="intro__title">
				{ __( 'Hello!' ) }
				<span>{ introTitle }</span>
			</h1>
			<Button className="intro__button" primary onClick={ goNext }>
				{ __( 'Get Started' ) }
			</Button>
		</div>
	);
};

export default Intro;
