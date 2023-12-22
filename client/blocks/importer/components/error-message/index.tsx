import { recordTracksEvent } from '@automattic/calypso-analytics';
import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	primaryBtnText?: string;
	secondaryBtnText?: string;
	onPrimaryBtnClick?: () => void;
	onSecondaryBtnClick?: () => void;
}

const ErrorMessage: React.FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const { primaryBtnText, secondaryBtnText, onPrimaryBtnClick, onSecondaryBtnClick } = props;

	useEffect( () => {
		recordTracksEvent( 'calypso_site_importer_start_import_failure' );
	}, [] );

	return (
		<div className="import__error-message import-layout__center">
			<div className="import__header">
				<div className="import__heading import__heading-center">
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
						{ onSecondaryBtnClick && (
							<NextButton type="button" variant="secondary" onClick={ onSecondaryBtnClick }>
								{ secondaryBtnText ?? translate( 'Back to goals' ) }
							</NextButton>
						) }
						{ onPrimaryBtnClick && (
							<div>
								<NextButton type="button" onClick={ onPrimaryBtnClick }>
									{ primaryBtnText ?? translate( 'Try again' ) }
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
