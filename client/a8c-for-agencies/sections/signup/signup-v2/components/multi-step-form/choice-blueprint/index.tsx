import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Form from 'calypso/a8c-for-agencies/components/form';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	onContinue: () => void;
	onSkip: () => void;
};

const ChoiceBlueprint: React.FC< Props > = ( { onContinue, onSkip } ) => {
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
			<p className="choice-blueprint__text">{ translate( 'Ready?' ) }</p>

			<div className="choice-blueprint__buttons">
				<Button className="choice-blueprint__button" variant="primary" onClick={ onContinue }>
					{ translate( 'Yes' ) }
				</Button>
				<Button className="choice-blueprint__button" variant="secondary" onClick={ onSkip }>
					{ translate( 'Not right now' ) }
				</Button>
			</div>
		</Form>
	);
};

export default ChoiceBlueprint;
