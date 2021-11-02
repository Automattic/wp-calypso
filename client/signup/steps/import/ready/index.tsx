import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { connect } from 'react-redux';
import { getUrlData } from 'calypso/state/imports/url-analyzer/selectors';
import { urlData } from '../types';
import ImportPlatformDetails from './platform-details';
import ImportPreview from './preview';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	urlData: urlData;
}

const ReadyPreview: React.FunctionComponent< Props > = ( { urlData } ) => {
	const { __ } = useI18n();
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = React.useState( false );

	const convertToFrendlyWebsiteName = ( website: string ): string => {
		const { hostname, pathname } = new URL( website );
		return ( hostname + ( pathname === '/' ? '' : pathname ) ).replace( 'www.', '' );
	};

	return (
		<>
			<div className="import__header">
				<div className="import__heading import__heading-center">
					<Title>{ __( 'Your content is ready for its brand new home' ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								/* translators: the website could be any domain (eg: "yourname.com") that is hosted by a platform (eg: Wix, Squarespace, Blogger, etc.) */
								__(
									'It looks like <strong>%(website)s</strong> is hosted by %(platform)s. To move your existing content to your newly created WordPress.com site, try our %(platform)s importer.'
								),
								{
									website: convertToFrendlyWebsiteName( urlData.url ),
									platform: urlData.platform,
								}
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
				<ImportPreview website={ urlData.url } />
			</div>

			{ isModalDetailsOpen && (
				<ImportPlatformDetails
					platform={ urlData.platform }
					onClose={ setIsModalDetailsOpen.bind( this, false ) }
				/>
			) }
		</>
	);
};

const ReadyNotStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading  import__heading-center">
					<Title>{ __( "Your existing content can't be imported" ) }</Title>
					<SubTitle>
						{ __(
							"Unfortunately, your content is on a platform that we don't yet support. Try Building a new WordPress site instead."
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton>{ __( 'Start building' ) }</NextButton>
						<div>
							<BackButton>{ __( 'Back to the start' ) }</BackButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

interface PropsWithoutUrl {
	platform: string;
}
const ReadyStep: React.FunctionComponent< PropsWithoutUrl > = ( { platform } ) => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading  import__heading-center">
					<Title>{ __( 'Your content is ready for its new home' ) }</Title>
					<SubTitle>
						{ sprintf(
							/* translators: platform name (eg: Wix, Squarespace, Blogger, etc.) */
							__(
								'To move your existing %(platform)s hosted content to your newly created WordPress.com site, try our %(platform)s importer.'
							),
							{
								platform,
							}
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
		</div>
	);
};

const ReadyPreviewStep = connect( ( state ) => ( {
	urlData: getUrlData( state ),
} ) )( ReadyPreview );

export { ReadyPreviewStep, ReadyNotStep, ReadyStep };
