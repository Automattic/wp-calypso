import { recordTracksEvent } from '@automattic/calypso-analytics';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	onBackToStart?: () => void;
	onStartBuilding?: () => void;
	onBackToStartText?: string;
}

const ErrorMessage: React.FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const { onBackToStart, onStartBuilding, onBackToStartText } = props;

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_start_import_failure' );
	}, [] );

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading-center">
					<Title>{ translate( 'Oops, something went wrong' ) }</Title>
					<SubTitle>
						{ translate( 'Please try again soon or {{a}}contact support{{/a}} for help.', {
							components: {
								a: (
									<a
										href="https://wordpress.com/help/contact"
										target="_blank"
										rel="noopener noreferrer"
									/>
								),
							},
						} ) }
					</SubTitle>

					<div className="import__buttons-group">
						{ onStartBuilding && (
							<NextButton type="button" onClick={ onStartBuilding }>
								{ translate( 'Start building' ) }
							</NextButton>
						) }
						{ onBackToStart && (
							<div>
								<NextButton className="" type="submit" onClick={ onBackToStart }>
									{ onBackToStartText ?? translate( 'Back to start' ) }
								</NextButton>
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default ErrorMessage;
