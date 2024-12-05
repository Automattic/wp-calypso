import { FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import IconBad from 'calypso/assets/images/a8c-for-agencies/feedback/bad.svg';
import IconGood from 'calypso/assets/images/a8c-for-agencies/feedback/good.svg';
import IconNeutral from 'calypso/assets/images/a8c-for-agencies/feedback/neutral.svg';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { FeedbackQueryData } from './types';

import './style.scss';

export type Props = {
	title: string;
	description: string;
	questionDetails: string;
	ctaText: string;
	onSubmit: ( data: FeedbackQueryData ) => void;
	onSkip: () => void;
};

export function A4AFeedback( {
	title,
	description,
	questionDetails,
	ctaText,
	onSubmit,
	onSkip,
}: Props ) {
	const translate = useTranslate();
	const [ experience, setExperience ] = useState< string >( 'good' );
	const [ comments, setComments ] = useState< string >( '' );

	return (
		<div className="a4a-feedback__wrapper">
			<div className="a4a-feedback__content">
				<h1 className="a4a-feedback__title">{ title }</h1>
				<div className="a4a-feedback__description">{ description }</div>
				<div className="a4a-feedback__questions">
					<div className="a4a-feedback__question-details">{ questionDetails }</div>
					<div className="a4a-feedback__experience-selector">
						<div className="a4a-feedback__experience-selector-label">
							{ translate( 'Overall' ) }
						</div>
						<div className="a4a-feedback__experience-selector-buttons">
							<Button
								variant={ experience === 'good' ? 'primary' : 'secondary' }
								onClick={ () => setExperience( 'good' ) }
							>
								<img src={ IconGood } alt="Good" />
							</Button>
							<Button
								variant={ experience === 'neutral' ? 'primary' : 'secondary' }
								onClick={ () => setExperience( 'neutral' ) }
							>
								<img src={ IconNeutral } alt="Neutral" />
							</Button>
							<Button
								variant={ experience === 'bad' ? 'primary' : 'secondary' }
								onClick={ () => setExperience( 'bad' ) }
							>
								<img src={ IconBad } alt="Bad" />
							</Button>
						</div>
					</div>
					<FormFieldset>
						<FormLabel className="a4a-feedback__comments-label" htmlFor="comments">
							{ translate(
								'Additional feedback about this experience {{span}}(Optional){{/span}}',
								{ components: { span: <span></span> } }
							) }
						</FormLabel>
						<FormTextarea
							className="a4a-feedback__comments"
							name="comments"
							id="comments"
							value={ comments }
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) =>
								setComments( event.target.value )
							}
						/>
					</FormFieldset>
					<div className="a4a-feedback__cta">
						<Button
							variant="primary"
							onClick={ () => onSubmit( { experience, comments } ) }
							disabled={ ! experience }
						>
							{ ctaText }
						</Button>
						<Button className="a8c-blue-link" onClick={ onSkip }>
							{ translate( 'Skip feedback' ) }
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
