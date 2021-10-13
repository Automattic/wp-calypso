import { useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon, wordpress } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCurrentStep, useIsAnchorFm, usePath, Step } from '../../path';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import DomainPickerButton from '../domain-picker-button';
import Link from '../link';
import PlansButton from '../plans-button';
import type { FunctionComponent } from 'react';

import './style.scss';

const Header: FunctionComponent = () => {
	const { __ } = useI18n();
	const locale = useLocale();
	const currentStep = useCurrentStep();
	const isAnchorFmSignup = useIsAnchorFm();
	const makePath = usePath();

	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );

	// steps (including modals) where we show Domains button
	const showDomainsButton =
		[ 'DesignSelection', 'Style', 'Features', 'Plans', 'PlansModal' ].includes( currentStep ) &&
		! isAnchorFmSignup;

	// steps (including modals) where we show Plans button
	const showPlansButton =
		[ 'DesignSelection', 'Style', 'Features' ].includes( currentStep ) && ! isAnchorFmSignup;

	// locale button is hidden on DomainsModal, PlansModal, and AnchorFM flavored gutenboarding
	const showLocaleButton =
		! [ 'DomainsModal', 'PlansModal' ].includes( currentStep ) && ! isAnchorFmSignup;

	// CreateSite step clears state before redirecting, don't show the default text in this case
	const siteTitleDefault = 'CreateSite' === currentStep ? '' : __( 'Start your website' );

	const homeLink = '/';

	/* eslint-disable wpcalypso/jsx-classname-namespace */

	const changeLocaleButton = () => {
		return (
			<div className="gutenboarding__header-section-item gutenboarding__header-section-item--right gutenboarding__header-language-section">
				<Link to={ makePath( Step.LanguageModal ) }>
					<span
						className="gutenboarding__header-site-language-label"
						data-e2e-string="Site Language"
					>
						{ __( 'Site Language' ) }
					</span>
					<span className="gutenboarding__header-site-language-badge">{ locale }</span>
				</Link>
			</div>
		);
	};

	return (
		<div
			className="gutenboarding__header"
			role="region"
			aria-label={ __( 'Top bar' ) }
			tabIndex={ -1 }
		>
			<section className="gutenboarding__header-section">
				<div className="gutenboarding__header-section-item gutenboarding__header-section-item--wp-logo">
					<Button href={ homeLink }>
						<div className="gutenboarding__header-wp-logo">
							<Icon icon={ wordpress } size={ 28 } />
						</div>
					</Button>
				</div>
				<div
					className="gutenboarding__header-section-item gutenboarding__header-site-title-section"
					data-e2e-string={ ! siteTitle && siteTitleDefault ? 'Start your website' : null }
				>
					<div className="gutenboarding__header-site-title">
						{ siteTitle ? siteTitle : siteTitleDefault }
					</div>
				</div>
				<div className="gutenboarding__header-section-item gutenboarding__header-domain-section">
					{ showDomainsButton && <DomainPickerButton /> }
				</div>
				{ showLocaleButton && changeLocaleButton() }
				{ showPlansButton && (
					<div className="gutenboarding__header-section-item gutenboarding__header-plan-section gutenboarding__header-section-item--right">
						<PlansButton />
					</div>
				) }
			</section>
		</div>
	);
};

export default Header;
