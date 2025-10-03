import { Card, ProgressBar } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FC } from 'react';
import footerCardAltBackground from 'calypso/assets/images/jetpack/jp-licensing-checkout-footer-alt-bg.svg';
import footerCardBackground from 'calypso/assets/images/jetpack/jp-licensing-checkout-footer-bg.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Main from 'calypso/components/main';

import './style.scss';

interface Props {
	altLayout?: boolean;
	className?: string;
	title: TranslateResult;
	footerImage?: string;
	isLoading?: boolean;
	showContactUs?: boolean;
	showJetpackLogo?: boolean;
	showProgressIndicator?: boolean;
	progressIndicatorValue?: number;
	progressIndicatorTotal?: number;
	children?: React.ReactNode;
}

const LicensingActivation: FC< Props > = ( {
	altLayout,
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
		<Main
			fullWidthLayout
			className={ clsx( 'licensing-activation', className, { 'is-alt-layout': altLayout } ) }
		>
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
					<h1 className={ clsx( 'licensing-activation__title', { 'is-loading': isLoading } ) }>
						{ title }
					</h1>
					{ children }

					{ showContactUs && altLayout && (
						<div className="licensing-activation__card-footer-text">
							{ translate( 'Do you need help? {{a}}Contact us{{/a}}.', {
								components: {
									a: <a href={ supportContactLink } target="_blank" rel="noopener noreferrer" />,
								},
							} ) }
						</div>
					) }
				</div>
				<div
					className="licensing-activation__card-footer"
					style={ {
						backgroundImage: `url(${ altLayout ? footerCardAltBackground : footerCardBackground })`,
					} }
				>
					{ footerImage && (
						<div className="licensing-activation__card-footer-image">
							<img src={ footerImage } alt="Checkout Thank you" />
						</div>
					) }
					{ showContactUs && ! altLayout && (
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
