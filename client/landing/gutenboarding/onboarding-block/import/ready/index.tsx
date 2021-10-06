import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import ImportPlatformDetails from './platform-details';
import ImportPreview from './preview';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	website: string;
	platform: string;
}

const ReadyStep: React.FunctionComponent< Props > = ( { website, platform } ) => {
	const { __ } = useI18n();
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = React.useState( false );

	return (
		<>
			<div className="import__header">
				<div className="import__heading">
					<Title>{ __( 'Your content is ready for its brand new home' ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								__(
									'It looks like <strong>%1$s</strong> is hosted by %2$s. To move your existing content to your newly created WordPress.com site, try our Wix importer.'
								),
								website,
								platform
							),
							{ strong: createElement( 'strong' ) }
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton>{ __( 'Import your content' ) }</NextButton>
						<div>
							<BackButton onClick={ setIsModalDetailsOpen.bind( this, true ) }>
								{ __( 'What can be imported?' ) }
							</BackButton>
						</div>
					</div>
				</div>
			</div>
			<div className="import__content">
				<ImportPreview website={ website } />
			</div>

			{ isModalDetailsOpen && (
				<ImportPlatformDetails
					platform={ platform }
					onClose={ setIsModalDetailsOpen.bind( this, false ) }
				/>
			) }
		</>
	);
};

const ReadyNoUrlStep: React.FunctionComponent< Props > = ( { platform } ) => {
	const { __ } = useI18n();

	return (
		<>
			<div className="import__header">
				<div className="import__heading">
					<Title>{ __( 'Your content is ready for its new home' ) }</Title>
					<SubTitle>
						{ sprintf(
							__(
								'To move your existing %1$s hosted content to your newly created WordPress.com site, try our %1$s importer.'
							),
							platform
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton>{ __( 'Import your content' ) }</NextButton>
						<div>
							<BackButton>{ __( 'View the import guide' ) }</BackButton>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export { ReadyStep, ReadyNoUrlStep };
