import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import IconBad from './icons/bad.svg';
import IconGood from './icons/good.svg';
import IconNeutral from './icons/neutral.svg';
import { FeedbackQueryData } from './types';

import './style.scss';

export type Props = {
	title: string;
	description: string;
	questionDetails: string;
	onSubmit: ( data: FeedbackQueryData ) => void;
	onSkip: () => void;
};

export function A4AFeedback( { title, description, questionDetails, onSubmit, onSkip }: Props ) {
	const translate = useTranslate();
	const [ experience, setExperience ] = useState< string >( 'good' );
	const [ comments, setComments ] = useState< string >( '' );

	return (
		<div className="a4a-feedback__wrapper">
			<div className="a4a-feedback__content">
				<h1 className="a4a-feedback__title">{ title }</h1>
				<p className="a4a-feedback__description">{ description }</p>
				<div className="a4a-feedback__questions">
					<p className="a4a-feedback__question-details">{ questionDetails }</p>
					<div className="a4a-feedback__experience-selector">
						<p className="a4a-feedback__experience-label">{ translate( 'Overall experience' ) }</p>
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
					<p>{ translate( 'Additional feedback about this experience (Optional)' ) }</p>
					<textarea
						className="a4a-feedback__comments"
						value={ comments }
						onChange={ ( e ) => setComments( e.target.value ) }
					/>
					<div className="modal-footer">
						<Button
							variant="primary"
							onClick={ () => onSubmit( { experience, comments } ) }
							disabled={ ! experience }
						>
							{ translate( 'Submit and continue' ) }
						</Button>
						<Button onClick={ onSkip }>{ translate( 'Skip feedback' ) }</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
