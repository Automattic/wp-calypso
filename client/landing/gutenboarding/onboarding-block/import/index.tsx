import { Title, SubTitle, NextButton, BackButton } from '@automattic/onboarding';
import { createElement, createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import * as React from 'react';
import './style.scss';

const ImportSite: React.FunctionComponent = () => {
	const { __ } = useI18n();

	// Temp mock
	const data = {
		website: 'https://openweb.com/',
		platform: 'Platform',
	};

	const mShotUrl = `https://s0.wp.com/mshots/v1/${ data.website }`;

	return (
		<div className="gutenboarding-page import">
			<div className="import__header">
				<div className="import__heading">
					<Title>{ __( 'Your content is ready for its brand new home' ) }</Title>
					<SubTitle>
						{ createInterpolateElement(
							sprintf(
								__(
									'It looks like <strong>%1$s</strong> is hosted by %2$s. To move your existing content to your newly created WordPress.com site, try our Wix importer.'
								),
								data.website,
								data.platform
							),
							{ strong: createElement( 'strong' ) }
						) }
					</SubTitle>

					<div className="import__buttons-group">
						<NextButton>{ __( 'Import your content' ) }</NextButton>
						<div>
							<BackButton>{ __( 'What can be imported?' ) }</BackButton>
						</div>
					</div>
				</div>
			</div>
			<div className="import__content">
				<div className={ `import__preview` }>
					<div className="import__preview-wrapper">
						{
							<div role="presentation" className="import__preview-bar">
								<div role="presentation" className="import__preview-bar-dot" />
								<div role="presentation" className="import__preview-bar-dot" />
								<div role="presentation" className="import__preview-bar-dot" />
							</div>
						}
						<img
							className={ 'import__screenshot' }
							src={ mShotUrl }
							alt="Website screenshot preview"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ImportSite;
