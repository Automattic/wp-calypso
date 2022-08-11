import { Button } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	goNext: () => void;
	flowName: string | null;
}

const Intro: React.FC< Props > = ( { goNext, flowName } ) => {
	const { __ } = useI18n();

	const introContent =
		flowName === 'link-in-bio'
			? {
					title: createInterpolateElement(
						__( 'Your short bio and links,<br />accessible to your<br />audience in minutes' ),
						{ br: <br /> }
					),
					button: __( 'Create your Link in bio' ),
			  }
			: {
					title: createInterpolateElement(
						__( "Your stories, right into<br />your readers' inbox, now!" ),
						{
							br: <br />,
						}
					),
					button: __( 'Create your newsletter' ),
			  };

	return (
		<div className="intro__content">
			<h1 className="intro__title">
				<span>{ introContent.title }</span>
			</h1>
			<Button className="intro__button" primary onClick={ goNext }>
				{ introContent.button }
			</Button>
		</div>
	);
};

export default Intro;
