/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Title, SubTitle, NextButton, SkipButton } from '@automattic/onboarding';
import { TextControl, FormFileUpload } from '@wordpress/components';
import React, { FunctionComponent } from 'react';
import './style.scss';

export const AddSubscriberForm: FunctionComponent = () => {
	return (
		<div className={ 'add-subscriber' }>
			<div className={ 'add-subscriber__title-container' }>
				<h2 className={ 'add-subscriber__title-emoji' }>🤝</h2>
				<Title>Add subscribers</Title>
				<SubTitle>You can invite some people to your list.</SubTitle>
			</div>
			<div className={ 'add-subscriber__form--container' }>
				<form>
					<TextControl
						placeholder={ 'sibling@email.com' }
						value={ '' }
						onChange={ () => {
							/* on value change */
						} }
					/>
					<TextControl
						placeholder={ 'parents@email.com' }
						value={ '' }
						onChange={ () => {
							/* on value change */
						} }
					/>
					<TextControl
						placeholder={ 'friend@email.com' }
						value={ '' }
						onChange={ () => {
							/* on value change */
						} }
					/>

					<label>
						Or bring your mailing list from other newsletters by{ ' ' }
						<FormFileUpload
							onChange={ () => {
								/* on value change */
							} }
						>
							uploading a CSV file
						</FormFileUpload>
						.
					</label>

					<NextButton type={ 'submit' } className={ 'add-subscriber__form-submit-btn' }>
						Add subscribers
					</NextButton>
					<SkipButton className={ 'add-subscriber__form-skip-btn' }>Not yet</SkipButton>
				</form>
			</div>
		</div>
	);
};
