import { Card, ProgressBar } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FC } from 'react';
import footerCardBackground from 'calypso/assets/images/jetpack/jp-licensing-checkout-footer-bg.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

interface Props {
	className?: string;
	title: TranslateResult;
	footerImage?: string;
	isLoading?: boolean;
	showContactUs?: boolean;
	showJetpackLogo?: boolean;
	showProgressIndicator?: boolean;
	progressIndicatorValue?: number;
	progressIndicatorTotal?: number;
}

const LicensingActivation: FC< Props > = ( {
	children,
	className,
	title,
	footerImage,
	isLoading = false,
	showContactUs = false,
	showJetpackLogo = true,
	showProgressIndicator = false,
	progressIndicatorValue = 0,
	progressIndicatorTotal = 0,
} ) => {
	const translate = useTranslate();
	const progressBarProperties = {
		value: progressIndicatorValue,
		total: progressIndicatorTotal,
	};

	const supportContactLink =
		'https://jetpack.com/support/install-jetpack-and-connect-your-new-plan/';

	return (
		<Main fullWidthLayout className={ classnames( 'licensing-activation', className ) }>
			<Card className="licensing-activation__card">
				<div className="licensing-activation__card-main">
					<div className="licensing-activation__card-top">
						{ showJetpackLogo && <JetpackLogo size={ 45 } /> }
						{ showProgressIndicator && (
							<ProgressBar
								className="licensing-activation__progress-bar"
								{ ...progressBarProperties }
							/>
						) }
					</div>
					<h1
						className={ classnames( 'licensing-activation__title', { 'is-loading': isLoading } ) }
					>
						{ preventWidows( title ) }
					</h1>
					{ children }
				</div>
				<div
					className="licensing-activation__card-footer"
					style={ { backgroundImage: `url(${ footerCardBackground })` } }
				>
					{ footerImage && (
						<div className="licensing-activation__card-footer-image">
							<img src={ footerImage } alt="Checkout Thank you" />
						</div>
					) }
					{ showContactUs && (
						<div className="licensing-activation__card-footer-text">
							{ translate( 'Do you need help? {{a}}Contact us{{/a}}.', {
								components: {
									a: <a href={ supportContactLink } target="_blank" rel="noopener noreferrer" />,
								},
							} ) }
						</div>
					) }
				</div>
			</Card>
		</Main>
	);
};

export default LicensingActivation;
