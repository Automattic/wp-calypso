import { FormLabel, ExperienceControl } from '@automattic/components';
import { Button, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextarea from 'calypso/components/forms/form-textarea';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import useShowFeedback from './hooks/use-show-a4a-feedback';
import type { FeedbackType, FeedbackSuggestion } from './types';

import './style.scss';

export function A4AFeedback( { type }: { type: FeedbackType } ) {
	const translate = useTranslate();
	const [ experience, setExperience ] = useState< string >( 'good' );
	const [ comments, setComments ] = useState< string >( '' );
	const [ suggestions, setSuggestions ] = useState< FeedbackSuggestion[] >( [] );

	const {
		feedbackProps: { title, description, suggestion, onSubmit, onSkip },
		isSubmitting,
	} = useShowFeedback( type );

	const onSuggestionChange = ( option: FeedbackSuggestion ) => {
		if ( suggestions.find( ( suggestion ) => suggestion.value === option.value ) ) {
			setSuggestions( ( prev ) =>
				prev.filter( ( suggestion ) => suggestion.value !== option.value )
			);
		} else {
			setSuggestions( ( prev ) => [ ...prev, option ] );
		}
	};

	return (
		<Layout className="a4a-feedback" title={ title } wide>
			<LayoutBody>
				<div className="a4a-feedback__wrapper">
					<div className="a4a-feedback__content">
						<h1 className="a4a-feedback__title">{ title }</h1>
						<div className="a4a-feedback__description">{ description }</div>
						<div className="a4a-feedback__questions">
							<div className="a4a-feedback__question-details">
								{ translate( 'Share your feedback' ) }
							</div>
							<ExperienceControl
								label={ translate( 'What was your experience like?' ) }
								onChange={ ( experience ) => setExperience( experience ) }
								selectedExperience={ experience }
							/>
							{ suggestion && (
								<FormFieldset>
									<FormLabel className="a4a-feedback__comments-label" htmlFor="suggestion">
										{ suggestion.label }
									</FormLabel>
									<div className="a4a-feedback__suggestions">
										{ suggestion.options.map( ( option ) => (
											<CheckboxControl
												key={ `suggestion-${ option.value }` }
												label={ option.label }
												checked={
													!! suggestions.find( ( suggestion ) => suggestion.value === option.value )
												}
												onChange={ () => onSuggestionChange( option ) }
											/>
										) ) }
									</div>
								</FormFieldset>
							) }
							<FormFieldset>
								<FormLabel className="a4a-feedback__comments-label" htmlFor="comments">
									{ translate( 'Share your suggestions' ) }
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
									onClick={ () =>
										onSubmit( {
											experience,
											comments,
											suggestions: suggestions.map( ( suggestion ) => suggestion.value ),
										} )
									}
									disabled={ ! experience || isSubmitting }
									isBusy={ isSubmitting }
								>
									{ translate( 'Send your feedback' ) }
								</Button>
								<Button className="a8c-blue-link" onClick={ onSkip } disabled={ isSubmitting }>
									{ translate( 'Skip' ) }
								</Button>
							</div>
						</div>
					</div>
				</div>
			</LayoutBody>
		</Layout>
	);
}
