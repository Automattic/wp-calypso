import { BackButton, NextButton, SubTitle, Title } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';

import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */

interface Props {
	onBackToStart?: () => void;
	onStartBuilding?: () => void;
}

const NotAuthorized: React.FunctionComponent< Props > = ( props ) => {
	const { __ } = useI18n();
	const { onBackToStart, onStartBuilding } = props;

	return (
		<div className="import-layout__center">
			<div className="import__header">
				<div className="import__heading  import__heading-center">
					<Title>{ __( 'You are not authorized to import content' ) }</Title>
					<SubTitle>{ __( 'Please check with your site admin.' ) }</SubTitle>

					<div className="import__buttons-group">
						{ onStartBuilding && (
							<NextButton onClick={ onStartBuilding }>{ __( 'Start building' ) }</NextButton>
						) }
						{ onBackToStart && (
							<div>
								<BackButton onClick={ onBackToStart }>{ __( 'Back to start' ) }</BackButton>
							</div>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotAuthorized;
