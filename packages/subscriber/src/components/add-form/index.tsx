/* eslint-disable wpcalypso/jsx-classname-namespace */
import { Title, SubTitle } from '@automattic/onboarding';
import { TextControl } from '@wordpress/components';
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
				</form>
			</div>
		</div>
	);
};
