import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import { UrlData, GoToStep } from '../types';
import { convertPlatformName } from '../util';
import ImportPlatformDetails, { coveredPlatforms } from './platform-details';
import ImportPreview from './preview';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface ReadyPreviewProps {
	urlData: UrlData;
	siteSlug: string;
	goToImporterPage: ( platform: string ) => void;
}

const convertToFriendlyWebsiteName = ( website: string ): string => {
	const { hostname, pathname } = new URL( website );
	return ( hostname + ( pathname === '/' ? '' : pathname ) ).replace( 'www.', '' );
};

const ReadyPreviewStep: React.FunctionComponent< ReadyPreviewProps > = ( {
	urlData,
	goToImporterPage,
} ) => {
	const { __ } = useI18n();
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = React.useState( false );

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
									website: convertToFriendlyWebsiteName( urlData.url ),
									platform: convertPlatformName( urlData.platform ),
								}
							),
							{ strong: createElement( 'strong' ) }
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ () => goToImporterPage( urlData.platform ) }>
							{ __( 'Import your content' ) }
						</NextButton>
						{ coveredPlatforms.includes( urlData.platform ) && (
							<div>
								<BackButton onClick={ setIsModalDetailsOpen.bind( this, true ) }>
									{ __( 'What can be imported?' ) }
								</BackButton>
							</div>
						) }
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

interface ReadyNotProps {
	goToStep: GoToStep;
}

const ReadyNotStep: React.FunctionComponent< ReadyNotProps > = ( { goToStep } ) => {
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
						<NextButton onClick={ () => goToStep( 'design-setup-site', '', 'setup-site' ) }>
							{ __( 'Start building' ) }
						</NextButton>
						<div>
							<BackButton onClick={ () => goToStep( 'capture' ) }>
								{ __( 'Back to start' ) }
							</BackButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

interface ReadyProps {
	platform: string;
	goToImporterPage: ( platform: string ) => void;
}

const ReadyStep: React.FunctionComponent< ReadyProps > = ( props ) => {
	const { platform, goToImporterPage } = props;
	const { __ } = useI18n();
	const [ isModalDetailsOpen, setIsModalDetailsOpen ] = React.useState( false );

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
								platform: convertPlatformName( platform ),
							}
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ () => goToImporterPage( platform ) }>
							{ __( 'Import your content' ) }
						</NextButton>
						{ coveredPlatforms.includes( platform ) && (
							<div>
								<BackButton onClick={ setIsModalDetailsOpen.bind( this, true ) }>
									{ __( 'View the import guide' ) }
								</BackButton>
							</div>
						) }
					</div>
				</div>
			</div>
			{ isModalDetailsOpen && (
				<ImportPlatformDetails
					platform={ platform }
					onClose={ setIsModalDetailsOpen.bind( this, false ) }
				/>
			) }
		</div>
	);
};

interface ReadyWpComProps {
	urlData: UrlData;
	goToStep: GoToStep;
}

const ReadyAlreadyOnWPCOMStep: React.FunctionComponent< ReadyWpComProps > = ( {
	urlData,
	goToStep,
} ) => {
	const { __ } = useI18n();

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading  import__heading-center">
					<Title>{ __( 'Your site is already on WordPress.com' ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								/* translators: the website could be any domain (eg: "yourname.com") */
								__(
									'It looks like <strong>%(website)s</strong> is already on WordPress.com. Try a different address or start buidling a new site instead.'
								),
								{
									website: convertToFriendlyWebsiteName( urlData.url ),
								}
							),
							{ strong: createElement( 'strong' ) }
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton onClick={ () => goToStep( 'design-setup-site', '', 'setup-site' ) }>
							{ __( 'Start building' ) }
						</NextButton>
						<div>
							<BackButton onClick={ () => goToStep( 'capture' ) }>
								{ __( 'Back to start' ) }
							</BackButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export { ReadyPreviewStep, ReadyNotStep, ReadyStep, ReadyAlreadyOnWPCOMStep };
