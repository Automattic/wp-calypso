import { Button } from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import FormFooter from 'calypso/a8c-for-agencies/components/form/footer';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	onContinue: () => void;
	onSkip: () => void;
	goBack: () => void;
};

const ChoiceBlueprint: React.FC< Props > = ( { onContinue, onSkip, goBack } ) => {
	const translate = useTranslate();

	return (
		<Form
			className="choice-blueprint-form"
			title={ preventWidows(
				translate( 'Grow your business with a free personalized blueprint' )
			) }
			description={ translate(
				`By answering a few simple questions, we'll provide tips on maximizing your agency's impact.`
			) }
		>
			<FormFooter>
				<Button
					className="signup-multi-step-form__back-button"
					variant="tertiary"
					onClick={ goBack }
					icon={ arrowLeft }
					iconSize={ 18 }
				>
					{ translate( 'Back' ) }
				</Button>

				<div>
					<Button
						className="choice-blueprint__cancel-button"
						variant="tertiary"
						onClick={ onSkip }
						__next40pxDefaultSize
					>
						{ translate( 'Not right now' ) }
					</Button>
					<Button
						className="choice-blueprint__button"
						variant="primary"
						onClick={ onContinue }
						__next40pxDefaultSize
					>
						{ translate( 'Build my custom blueprint' ) }
					</Button>
				</div>
			</FormFooter>
		</Form>
	);
};

export default ChoiceBlueprint;
