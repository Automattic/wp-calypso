import { Button } from '@automattic/components';
interface Props {
	goNext: () => void;
}

const Intro: React.FC< Props > = ( { goNext } ) => {
	return (
		<div className="link-in-bio-intro__content">
			<h1 className="link-in-bio-intro__title">
				Hello!
				<span>Let’s set up your</span>
				Link in Bio
			</h1>
			<Button className="link-in-bio-intro__button" primary onClick={ goNext }>
				Get Started
			</Button>
		</div>
	);
};

export default Intro;
