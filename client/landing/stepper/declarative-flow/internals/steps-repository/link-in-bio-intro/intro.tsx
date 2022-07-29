import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
interface Props {
	goNext: () => void;
}

const Intro: React.FC< Props > = ( { goNext } ) => {
	const { __ } = useI18n();

	return (
		<div className="link-in-bio-intro__content">
			<h1 className="link-in-bio-intro__title">
				{ __( 'Hello!' ) }
				<span>{ __( 'Let’s set up your' ) }</span>
				{ __( 'Link in Bio' ) }
			</h1>
			<Button className="link-in-bio-intro__button" primary onClick={ goNext }>
				{ __( 'Get Started' ) }
			</Button>
		</div>
	);
};

export default Intro;
